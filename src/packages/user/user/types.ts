import type { UmbUserEntityType } from './entity.js';
import type { UmbReferenceByUnique } from '@umbraco-cms/backoffice/models';
import { UserStateModel, type UserTwoFactorProviderModel } from '@umbraco-cms/backoffice/external/backend-api';

export type UmbUserStateEnum = UserStateModel;
export const UmbUserStateEnum = UserStateModel;

export interface UmbUserDetailModel {
	avatarUrls: Array<string>;
	createDate: string | null;
	documentStartNodeUniques: Array<UmbReferenceByUnique>;
	email: string;
	entityType: UmbUserEntityType;
	failedLoginAttempts: number;
	hasDocumentRootAccess: boolean;
	hasMediaRootAccess: boolean;
	isAdmin: boolean;
	languageIsoCode: string | null;
	lastLockoutDate: string | null;
	lastLoginDate: string | null;
	lastPasswordChangeDate: string | null;
	mediaStartNodeUniques: Array<UmbReferenceByUnique>;
	name: string;
	state: UmbUserStateEnum | null;
	unique: string;
	updateDate: string | null;
	userGroupUniques: Array<UmbReferenceByUnique>;
	userName: string;
}

export type UmbUserMfaProviderModel = UserTwoFactorProviderModel;
