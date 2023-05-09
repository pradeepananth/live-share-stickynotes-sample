import {
  ContainerState,
  IClientInfo,
  IFluidContainerInfo,
  IFluidTenantInfo,
  ILiveShareHost,
  INtpTimeInfo,
  UserMeetingRole,
} from "@microsoft/live-share";
const LiveShareRoutePrefix = "livesync/v1";
const GetNtpTimeRoute = "getNTPTime";
const GetFluidTenantInfoRoute = "fluid/tenantInfo/get";
const RegisterClientRoute = "client/register";
const ClientRolesGetRoute = "clientRoles/get";
const UserGetRoute = "user/get";
const FluidTokenGetRoute = "fluid/token/get";
const FluidContainerGetRoute = "fluid/container/get";
const FluidContainerSetRoute = "fluid/container/set";

export class MockServerLiveShareHost implements ILiveShareHost {
  private constructor(
    private readonly userToken: string,
    private readonly meetingJoinUrl: string,
    private readonly skypeMri: string,
    private readonly apiEndpoint: string
  ) {}

  public static create(options: LiveShareHostOptions): ILiveShareHost {
    return new MockServerLiveShareHost(
      options.userToken,
      options.meetingJoinUrl,
      options.skypeMri,
      options.apiEndpoint
    );
  }

  async getClientRoles(
    clientId: string
  ): Promise<UserMeetingRole[] | undefined> {
    const request = this.constructBaseRequest() as FluidClientRolesInput;
    request.clientId = clientId;
    const response = await fetch(
      `${this.apiEndpoint}/${LiveShareRoutePrefix}/${ClientRolesGetRoute}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.userToken}`,
        },
        body: JSON.stringify(request),
      }
    );
    const data = await response.json();
    return data.roles;
  }

  async getFluidContainerId(): Promise<IFluidContainerInfo> {
    const request = this.constructBaseRequest() as FluidGetContainerIdInput;
    const response = await fetch(
      `${this.apiEndpoint}/${LiveShareRoutePrefix}/${FluidContainerGetRoute}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.userToken}`,
        },
        body: JSON.stringify(request),
      }
    );
    const data = await response.json();
    return data;
  }

  async getFluidTenantInfo(): Promise<IFluidTenantInfo> {
    const request = this.constructBaseRequest() as FluidTenantInfoInput;
    request.expiresAt = 0;
    const response = await fetch(
      `${this.apiEndpoint}/${LiveShareRoutePrefix}/${GetFluidTenantInfoRoute}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.userToken}`,
        },
        body: JSON.stringify(request),
      }
    );

    const data = await response.json();
    return data.broadcaster.frsTenantInfo;
  }

  async getFluidToken(containerId?: string): Promise<string> {
    const request = this.constructBaseRequest() as FluidGetTokenInput;
    request.containerId = containerId;
    const response = await fetch(
      `${this.apiEndpoint}/${LiveShareRoutePrefix}/${FluidTokenGetRoute}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.userToken}`,
        },
        body: JSON.stringify(request),
      }
    );
    const data = await response.json();
    return data.token;
  }

  async getNtpTime(): Promise<INtpTimeInfo> {
    const response = await fetch(
      `${this.apiEndpoint}/${LiveShareRoutePrefix}/${GetNtpTimeRoute}`,
      {
        method: "GET",
      }
    );
    const data = await response.json();
    return data;
  }

  async registerClientId(clientId: string): Promise<UserMeetingRole[]> {
    const request = this.constructBaseRequest() as FluidClientRolesInput;
    request.clientId = clientId;
    const response = await fetch(
      `${this.apiEndpoint}/${LiveShareRoutePrefix}/${RegisterClientRoute}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.userToken}`,
        },
        body: JSON.stringify(request),
      }
    );
    if (response.status === 200) {
      return [UserMeetingRole.organizer];
    } else {
      return [UserMeetingRole.guest];
    }
  }

  async getClientInfo(clientId: string): Promise<IClientInfo> {
    const request = this.constructBaseRequest() as FluidClientRolesInput;
    request.clientId = clientId;
    const response = await fetch(
      `${this.apiEndpoint}/${LiveShareRoutePrefix}/${UserGetRoute}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.userToken}`,
        },
        body: JSON.stringify(request),
      }
    );
    const data = await response.json();
    return {
      userId: data.userId,
      displayName: data.displayName,
      roles: [UserMeetingRole.organizer],
    };
  }

  async setFluidContainerId(containerId: string): Promise<IFluidContainerInfo> {
    const request = this.constructBaseRequest() as FluidSetContainerIdInput;
    request.containerId = containerId;
    const response = await fetch(
      `${this.apiEndpoint}/${LiveShareRoutePrefix}/${FluidContainerSetRoute}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.userToken}`,
        },
        body: JSON.stringify(request),
      }
    );
    const data = await response.json();
    return data;
  }

  private constructBaseRequest(): LiveShareRequestBase {
    const originUri = window.location.href;
    return {
      originUri,
      appId: "com.stickynotes.test",
      teamsContextType: TeamsCollabContextType.MeetingJoinUrl,
      teamsContext: {
        meetingJoinUrl: this.meetingJoinUrl,
        skypeMri: this.skypeMri,
      },
    };
  }
}

export interface AcsLiveShareHostOptions {
  teamsMeetingJoinUrl: string;
  acsTokenProvider: () => string;
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

export interface LiveShareHostOptions {
  apiEndpoint: string;
  meetingJoinUrl: string;
  skypeMri: string;
  userToken: string;
}
