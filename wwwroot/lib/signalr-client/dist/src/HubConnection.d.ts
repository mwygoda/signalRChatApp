import { ConnectionClosed } from "./Common";
import { IConnection } from "./IConnection";
import { Observable } from "./Observable";
import { IHubProtocol } from "./IHubProtocol";
export { TransportType } from "./Transports";
export { HttpConnection } from "./HttpConnection";
export { JsonHubProtocol } from "./JsonHubProtocol";
export declare class HubConnection {
    private connection;
    private callbacks;
    private methods;
    private id;
    private connectionClosedCallback;
    private protocol;
    constructor(connection: IConnection, protocol?: IHubProtocol);
    private onDataReceived(data);
    private invokeClientMethod(invocationMessage);
    private onConnectionClosed(error);
    start(): Promise<void>;
    stop(): void;
    stream<T>(methodName: string, ...args: any[]): Observable<T>;
    send(methodName: string, ...args: any[]): Promise<void>;
    invoke(methodName: string, ...args: any[]): Promise<any>;
    on(methodName: string, method: (...args: any[]) => void): void;
    onClosed: ConnectionClosed;
    private createInvocation(methodName, args, nonblocking);
}
