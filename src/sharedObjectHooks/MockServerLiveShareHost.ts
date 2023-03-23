import {
  ContainerState,
  IFluidContainerInfo,
  IFluidTenantInfo,
  ILiveShareHost,
  INtpTimeInfo,
  UserMeetingRole,
} from "@microsoft/live-share";
import { AxiosInstance, CreateAxiosDefaults, default as axios } from "axios";

const LiveShareRoutePrefix = "/livesync/v1";
const GetNtpTimeRoute = "getNTPTime";
const GetFluidTenantInfoRoute = "fluid/tenantInfo/get";
const RegisterClientRolesRoute = "clientRoles/register";
const ClientRolesGetRoute = "clientRoles/get";
const FluidTokenGetRoute = "fluid/token/get";
const FluidContainerGetRoute = "fluid/container/get";
const FluidContainerSetRoute = "fluid/container/set";

export class MockServerLiveShareHost implements ILiveShareHost {
  private constructor(
    private readonly axios: AxiosInstance,
    private readonly meetingJoinUrl: string,
    private readonly skypeMri: string
  ) {}
  async getClientRoles(
    clientId: string
  ): Promise<UserMeetingRole[] | undefined> {
    const request = this.constructBaseRequest() as FluidClientRolesInput;
    request.clientId = clientId;
    const response = await this.axios.post<UserMeetingRole[]>(
      `${LiveShareRoutePrefix}/${ClientRolesGetRoute}`,
      request
    );
    return response.data;
  }
  async getFluidContainerId(): Promise<IFluidContainerInfo> {
    const request = this.constructBaseRequest() as FluidGetContainerIdInput;
    const response = await this.axios.post<IFluidContainerInfo>(
      `${LiveShareRoutePrefix}/${FluidContainerGetRoute}`,
      request
    );
    return response.data;
  }
  async getFluidTenantInfo(): Promise<IFluidTenantInfo> {
    const request = this.constructBaseRequest() as FluidTenantInfoInput;
    request.expiresAt = 0;
    const response = await this.axios.post<FluidCollabTenantInfo>(
      `${LiveShareRoutePrefix}/${GetFluidTenantInfoRoute}`,
      request
    );
    return response.data.broadcaster.frsTenantInfo;
  }
  async getFluidToken(containerId?: string): Promise<string> {
    const request = this.constructBaseRequest() as FluidGetTokenInput;
    request.containerId = containerId;
    const response = await this.axios.post<any>(
      `${LiveShareRoutePrefix}/${FluidTokenGetRoute}`,
      request
    );
    return response.data.token;
  }
  async getNtpTime(): Promise<INtpTimeInfo> {
    const response = await this.axios.get<INtpTimeInfo>(
      `${LiveShareRoutePrefix}/${GetNtpTimeRoute}`
    );
    return response.data;
  }
  async registerClientId(clientId: string): Promise<UserMeetingRole[]> {
    const request = this.constructBaseRequest() as FluidClientRolesInput;
    request.clientId = clientId;
    const response = await this.axios.post<UserMeetingRole[]>(
      `${LiveShareRoutePrefix}/${RegisterClientRolesRoute}`,
      request
    );
    return response.data;
  }
  async setFluidContainerId(containerId: string): Promise<IFluidContainerInfo> {
    const request = this.constructBaseRequest() as FluidSetContainerIdInput;
    request.containerId = containerId;
    const response = await this.axios.post(
      `${LiveShareRoutePrefix}/${FluidContainerSetRoute}`,
      request
    );
    return response.data;
  }
  private constructBaseRequest(): LiveShareRequestBase {
    const originUri = window.location.href;
    return {
      appId: "test",
      originUri,
      teamsContextType: TeamsCollabContextType.MeetingJoinUrl,
      teamsContext: {
        meetingJoinUrl: this.meetingJoinUrl,
        skypeMri: this.skypeMri,
      },
    };
  }
  public static create(options: LiveShareHostOptions): ILiveShareHost {
    const axiosDefaults: CreateAxiosDefaults<any> = {
      baseURL: options.apiEndpoint,
    };
    const axiosConfig = { ...axiosDefaults, ...options?.axiosOptions };
    const axiosInstance = axios.create(axiosConfig);
    axiosInstance.interceptors.request.use((config) => {
      const { userToken } = options;
      config.headers.set("Authorization", `Bearer ${userToken}`, true);
      return config;
    });
    return new MockServerLiveShareHost(
      axiosInstance,
      options.meetingJoinUrl,
      options.skypeMri
    );
  }
}
export interface LiveShareHostOptions {
  apiEndpoint: string;
  meetingJoinUrl: string;
  skypeMri: string;
  userToken: string;
  axiosOptions?: CreateAxiosDefaults<any>;
}
interface FluidCollabTenantInfo {
  broadcaster: BroadcasterInfo;
}
interface BroadcasterInfo {
  type: string;
  frsTenantInfo: FluidTenantInfo;
}
interface FluidTenantInfo {
  tenantId: string;
  ordererEndpoint: string;
  storageEndpoint: string;
  serviceEndpoint: string;
}
interface FluidTenantInfoInput {
  appId?: string;
  originUri: string;
  teamsContextType: TeamsCollabContextType;
  teamsContext: TeamsContext;
  expiresAt: number;
}
interface FluidGetContainerIdInput extends LiveShareRequestBase {}
interface TeamsContext {
  meetingJoinUrl?: string;
  skypeMri?: string;
}
interface FluidSetContainerIdInput extends LiveShareRequestBase {
  containerId: string;
}
interface FluidContainerInfo {
  containerState: ContainerState;
  shouldCreate: boolean;
  containerId: string;
  retryAfter: number;
}
interface FluidClientRolesInput extends LiveShareRequestBase {
  clientId: string;
}
interface FluidGetTokenInput {
  appId?: string;
  originUri: string;
  teamsContextType: TeamsCollabContextType;
  teamsContext: TeamsContext;
  containerId?: string;
  // TODO: these are not used on server side    // userId?: string;    // userName?: string;
}
interface User {
  mri: string;
}
enum TeamsCollabContextType {
  MeetingJoinUrl = 1,
  GroupChatId,
}
interface LiveShareRequestBase {
  appId?: string;
  originUri: string;
  teamsContextType: TeamsCollabContextType;
  teamsContext: TeamsContext;
}
