import {nanoid} from 'nanoid';

import {Message, Request} from '../../types/generated/omnichat/omnichat_contracts';
import {MessagesDataSource} from '../../types/internals/messages-data-source';
import {EventLogger, OmnichatEvents} from '../../types/public/common/event-logger';
import {DataSourceError, DataSourceFetchResult} from '../../types/public/common/data-source';
import {OmnichatXiva} from '../lib/xiva';
import {invokeSafe} from '../lib/invoke-safe';
import {getErrorType} from './utils/errorUtils';

type Controls = Record<string, (result: IteratorResult<Message[]>) => void>;

type Cursor = {
    before?: string;
    after?: string;
};

type Cursors = Record<string, Cursor>;

type FetchResult = DataSourceFetchResult<Message>;

const DEFAULT_REQUEST: Omit<Request, 'requestId'> = {
    getLastPage: undefined,
    getPrevPage: undefined,
    getNextPage: undefined,
    subscribe: undefined,
    unsubscribe: undefined,
    getPage: undefined,
};

export class ChatMessagesDataSource implements MessagesDataSource<Message> {
    private controls: Controls = {};
    private cursors: Cursors = {};
    private notificationsListeners: Record<string, () => void> = {};
    private accumulated: Record<string, Message[]> = {};
    private memoizedAfterPromise: Record<string, Promise<IteratorResult<Message[]>>> = {};

    constructor(private xiva: OmnichatXiva, private eventLogger?: EventLogger) {
        invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceCreated, payload: {}});
    }

    public async fetch({chatId, messageId}: {chatId: string; messageId?: string}): Promise<FetchResult> {
        const isSearch = !!messageId;
        return isSearch ? this.findWithSearch(chatId, messageId) : this.findWithoutSearch(chatId);
    }

    private subscribe(chatId: string, pageToken: string) {
        if (this.notificationsListeners[chatId]) {
            return;
        }

        // Не блокирующая выполенние подписка на новые сообщения
        (async () => {
            const requestId = nanoid();

            invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceSubscribe, payload: {chatId, requestId}});

            try {
                await this.xiva.send({
                    ...DEFAULT_REQUEST,
                    requestId,
                    subscribe: {
                        pageToken,
                    },
                }, {chatId});

                invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceSubscribeSuccess, payload: {chatId, requestId}});
            } catch {
                invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceSubscribeFailure, payload: {chatId, requestId}});
            }
        })();

        this.notificationsListeners[chatId] = this.xiva.subscribe(chatId, async response => {
            const {messages} = response;
            const control = this.controls[chatId];

            invokeSafe(this.eventLogger, {
                type: OmnichatEvents.ChatMessagesDataSourceNotificationReceived,
                payload: {chatId},
            });

            if (control) {
                delete this.memoizedAfterPromise[chatId];

                control({
                    done: false,
                    value: messages,
                });
            } else {
                const accumulatedMessages = this.accumulated[chatId];

                if (accumulatedMessages) {
                    accumulatedMessages.push(...messages);
                } else {
                    this.accumulated[chatId] = messages;
                }
            }
        });
    }

    private async findWithSearch(chatId: string, messageId: string): Promise<FetchResult> {
        const requestId = nanoid();

        invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceFetchWithSearch, payload: {chatId, requestId}});

        try {
            const response = await this.xiva.send({
                ...DEFAULT_REQUEST,
                requestId,
                getPage: {chatId, messageId},
            }, {chatId});

            const cursors = this.getCursors(chatId, messageId);
            const {pageToken, messages} = response;
            cursors.before = pageToken;
            cursors.after = pageToken;

            invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceFetchWithSearchSuccess, payload: {chatId, requestId}});

            return {
                page: messages,
                before: this.createBeforeAsyncIterator(chatId, messageId),
                after: this.createAfterAsyncIterator(chatId, messageId),
                destroy: () => this.destroy(chatId, messageId),
            };
        } catch (err) {
            invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceFetchWithSearchFailure, payload: {chatId, err, requestId}});

            throw new DataSourceError(getErrorType(err), err);
        }
    }

    private async findWithoutSearch(chatId: string): Promise<FetchResult> {
        const requestId = nanoid();

        invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceFetchWithoutSearch, payload: {chatId, requestId}});

        try {
            const response = await this.xiva.send({
                ...DEFAULT_REQUEST,
                requestId,
                getLastPage: {chatId},
            }, {chatId});

            const cursors = this.getCursors(chatId);
            const {pageToken, messages} = response;
            cursors.before = pageToken;
            cursors.after = pageToken;

            this.subscribe(chatId, pageToken);

            invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceFetchWithoutSearchSuccess, payload: {chatId, requestId}});

            return {
                page: messages,
                before: this.createBeforeAsyncIterator(chatId),
                after: this.createAfterAsyncIterator(chatId),
                destroy: () => this.destroy(chatId),
            };
        } catch (err) {
            invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceFetchWithoutSearchFailure, payload: {chatId, requestId, err}});

            throw new DataSourceError(getErrorType(err), err);
        }
    }

    private destroy(chatId: string, messageId?: string) {
        const cursorsKey = this.getCursorsKey(chatId, messageId);

        delete this.cursors[cursorsKey];
        delete this.memoizedAfterPromise[chatId];

        this.controls[chatId]?.({
            done: true,
            value: [],
        });

        if (this.notificationsListeners[chatId]) {
            this.notificationsListeners[chatId]();
            delete this.notificationsListeners[chatId];
        }

        if (this.notificationsListeners[chatId]) {
            const requestId = nanoid();
            invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceUnsubscribe, payload: {chatId, requestId}});

            this.xiva.send({
                ...DEFAULT_REQUEST,
                requestId,
                unsubscribe: {
                    chatId,
                },
            }, {chatId});

            delete this.notificationsListeners[chatId];
        }

        invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceDestroyed, payload: {chatId}});
    }

    private createBeforeAsyncIterator(chatId: string, messageId?: string): AsyncIterable<Message[]> {
        return {
            [Symbol.asyncIterator]: () => ({
                next: async () => {
                    const requestId = nanoid();

                    invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceBefore, payload: {chatId, requestId}});

                    try {
                        const cursors = this.getCursors(chatId, messageId);

                        assert(cursors.before);

                        const response = await this.xiva.send({
                            ...DEFAULT_REQUEST,
                            requestId,
                            getPrevPage: {pageToken: cursors.before},
                        }, {chatId});

                        const {pageToken, messages} = response;
                        cursors.before = pageToken;

                        invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceBeforeSuccess, payload: {chatId, requestId}});

                        return {
                            done: !messages.length,
                            value: messages,
                        };
                    } catch (err) {
                        invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceBeforeFailure, payload: {chatId, requestId, err}});

                        throw new DataSourceError(getErrorType(err), err);
                    }
                },
            }),
        };
    }

    private createAfterAsyncIterator(chatId: string, messageId?: string) {
        return {
            [Symbol.asyncIterator]: () => ({
                next: async () => {
                    if (this.notificationsListeners[chatId]) {
                        if (typeof this.memoizedAfterPromise[chatId] !== 'undefined') {
                            return this.memoizedAfterPromise[chatId];
                        }

                        const accumulatedMessages = this.accumulated[chatId];

                        if (accumulatedMessages) {
                            this.memoizedAfterPromise[chatId] = Promise.resolve<IteratorResult<Message[]>>({
                                done: false,
                                value: accumulatedMessages,
                            });

                            delete this.accumulated[chatId];
                        } else {
                            this.memoizedAfterPromise[chatId] = new Promise<IteratorResult<Message[]>>(resolve => {
                                this.controls[chatId] = resolve;
                            });
                        }

                        return this.memoizedAfterPromise[chatId];
                    } else {
                        const requestId = nanoid();

                        invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceAfter, payload: {chatId, requestId}});

                        try {
                            const cursors = this.getCursors(chatId, messageId);

                            assert(cursors.after);

                            const response = await this.xiva.send({
                                ...DEFAULT_REQUEST,
                                requestId,
                                getNextPage: {pageToken: cursors.after},
                            }, {chatId});

                            const {pageToken, messages} = response;
                            cursors.after = pageToken;

                            invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceAfterSuccess, payload: {chatId, requestId}});

                            if (!messages.length) {
                                this.subscribe(chatId, pageToken);
                            }

                            return {
                                done: false,
                                value: messages,
                            };
                        } catch (err) {
                            invokeSafe(this.eventLogger, {type: OmnichatEvents.ChatMessagesDataSourceAfterFailure, payload: {chatId, requestId, err}});

                            throw new DataSourceError(getErrorType(err), err);
                        }
                    }
                },
            }),
        };
    }

    private getCursorsKey(chatId: string, messageId?: string): string {
        return [chatId, messageId].filter(Boolean).join('_');
    }

    private getCursors(chatId: string, messageId: string = ''): Cursor {
        const cursorsKey = this.getCursorsKey(chatId, messageId);

        if (!this.cursors[cursorsKey]) {
            this.cursors[cursorsKey] = {};
        }

        return this.cursors[cursorsKey]!;
    }
}

function assert<T>(x?: T | null, message?: string): asserts x is T {
    if (typeof x === 'undefined' || x === null) {
        throw new Error(message);
    }
}
