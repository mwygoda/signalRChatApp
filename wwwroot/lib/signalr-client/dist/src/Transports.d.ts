import { DataReceived, TransportClosed } from "./Common";
import { IHttpClient } from "./HttpClient";
export declare enum TransportType {
    WebSockets = 0,
    ServerSentEvents = 1,
    LongPolling = 2,
}
export declare const enum TransferMode {
    Text = 1,
    Binary = 2,
}
export interface ITransport {
    connect(url: string, requestedTransferMode: TransferMode): Promise<TransferMode>;
    send(data: any): Promise<void>;
    stop(): void;
    onDataReceived: DataReceived;
    onClosed: TransportClosed;
}
export declare class WebSocketTransport implements ITransport {
    private webSocket;
    connect(url: string, requestedTransferMode: TransferMode): Promise<TransferMode>;
    send(data: any): Promise<void>;
    stop(): void;
    onDataReceived: DataReceived;
    onClosed: TransportClosed;
}
export declare class ServerSentEventsTransport implements ITransport {
    private eventSource;
    private url;
    private httpClient;
    constructor(httpClient: IHttpClient);
    connect(url: string, requestedTransferMode: TransferMode): Promise<TransferMode>;
    send(data: any): Promise<void>;
    stop(): void;
    onDataReceived: DataReceived;
    onClosed: TransportClosed;
}
export declare class LongPollingTransport implements ITransport {
    private url;
    private httpClient;
    private pollXhr;
    private shouldPoll;
    constructor(httpClient: IHttpClient);
    connect(url: string, requestedTransferMode: TransferMode): Promise<TransferMode>;
    private poll(url, transferMode);
    send(data: any): Promise<void>;
    stop(): void;
    onDataReceived: DataReceived;
    onClosed: TransportClosed;
}
