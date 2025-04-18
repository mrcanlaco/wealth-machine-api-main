export interface CreateInvitationInput {
  email: string;
  role: string;
}

export interface Invitation {
  id: string;
  machineId: string;
  email: string;
  role: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export class InvitationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvitationError';
  }
}
