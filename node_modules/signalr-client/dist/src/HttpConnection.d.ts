import { DataReceived, ConnectionClosed } from "./Common";
import { IConnection } from "./IConnection";
import { IHttpConnectionOptions } from "./IHttpConnectionOptions";
export declare class HttpConnection implements IConnection {
    private connectionState;
    private url;
    private connectionId;
    private httpClient;
    private transport;
    private options;
    private startPromise;
    readonly features: any;
    constructor(url: string, options?: IHttpConnectionOptions);
    start(): Promise<void>;
    private startInternal();
    private createTransport(transport, availableTransports);
    private isITransport(transport);
    private changeState(from, to);
    send(data: any): Promise<void>;
    stop(): Promise<void>;
    private stopConnection(raiseClosed, error?);
    onDataReceived: DataReceived;
    onClosed: ConnectionClosed;
}
