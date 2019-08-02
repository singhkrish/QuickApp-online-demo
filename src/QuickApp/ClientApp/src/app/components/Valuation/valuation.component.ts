
 



import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { AlertService, MessageSeverity } from '../../services/alert.service';
import { AccountService } from '../../services/account.service';
import { Utilities } from '../../services/utilities';
import { User } from '../../models/user.model';
import { UserEdit } from '../../models/user-edit.model';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';


@Component({
  selector: 'valuation',
  templateUrl: './valuation.component.html',
  styleUrls: ['./valuation.component.css']
})
export class ValuationComponent  implements OnInit {

  private isEditMode = false;
  private isNewUser = false;
  private isSaving = false;
  private isChangePassword = false;
  private isEditingSelf = false;
  private showValidationErrors = false;
  private editingUserName: string;
  private uniqueId: string = Utilities.uniqueId();
  private user: User = new User();
  private userEdit: UserEdit;
  private allRoles: Role[] = [];

  public formResetToggle = true;

  public changesSavedCallback: () => void;
  public changesFailedCallback: () => void;
  public changesCancelledCallback: () => void;

  @Input()
  isViewOnly: boolean;

  @Input()
  isGeneralEditor = false;





  @ViewChild('f')
  private form;

  // ViewChilds Required because ngIf hides template variables from global scope
  @ViewChild('userName')
  private userName;

  @ViewChild('userPassword')
  private userPassword;

  @ViewChild('email')
  private email;

  @ViewChild('currentPassword')
  private currentPassword;

  @ViewChild('newPassword')
  private newPassword;

  @ViewChild('confirmPassword')
  private confirmPassword;

  @ViewChild('roles')
  private roles;

  @ViewChild('rolesSelector')
  private rolesSelector;


  constructor(private alertService: AlertService, private accountService: AccountService) {
  }

  ngOnInit() {
    if (!this.isGeneralEditor) {
      this.loadCurrentUserData();
    }
  }



  private loadCurrentUserData() {
    this.alertService.startLoadingMessage();

    if (this.canViewAllRoles) {
      this.accountService.getUserAndRoles()
        .subscribe(results => this.onCurrentUserDataLoadSuccessful(results[0], results[1]),
          error => this.onCurrentUserDataLoadFailed(error));
    }
    else {
      this.accountService.getUser()
        .subscribe(user => this.onCurrentUserDataLoadSuccessful(user, user.roles.map(x => new Role(x))),
          error => this.onCurrentUserDataLoadFailed(error));
    }
  }


  private onCurrentUserDataLoadSuccessful(user: User, roles: Role[]) {
    this.alertService.stopLoadingMessage();
    this.user = user;
    this.allRoles = roles;
  }

  private onCurrentUserDataLoadFailed(error: any) {
    this.alertService.stopLoadingMessage();
    this.alertService.showStickyMessage('Load Error',
      `Unable to retrieve user data from the server.\r\nErrors: "${Utilities.getHttpResponseMessage(error)}"`,
      MessageSeverity.error, error);

    this.user = new User();
  }



  private getRoleByName(name: string) {
    return this.allRoles.find((r) => r.name == name);
  }



  private showErrorAlert(caption: string, message: string) {
    this.alertService.showMessage(caption, message, MessageSeverity.error);
  }


  public deletePasswordFromUser(user: UserEdit | User) {
    const userEdit = <UserEdit>user;

    delete userEdit.currentPassword;
    delete userEdit.newPassword;
    delete userEdit.confirmPassword;
  }


  private edit() {
    if (!this.isGeneralEditor) {
      this.isEditingSelf = true;
      this.userEdit = new UserEdit();
      Object.assign(this.userEdit, this.user);
    }
    else {
      if (!this.userEdit)
        this.userEdit = new UserEdit();

      this.isEditingSelf = this.accountService.currentUser ? this.userEdit.id == this.accountService.currentUser.id : false;
    }

    this.isEditMode = true;
    this.showValidationErrors = true;
    this.isChangePassword = false;
  }


  private save() {
    this.isSaving = true;
    this.alertService.startLoadingMessage('Saving changes...');

    if (this.isNewUser) {
      this.accountService.newUser(this.userEdit).subscribe(user => this.saveSuccessHelper(user), error => this.saveFailedHelper(error));
    }
    else {
      this.accountService.updateUser(this.userEdit).subscribe(response => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
    }
  }


  private saveSuccessHelper(user?: User) {
   
    this.isSaving = false;
    this.alertService.stopLoadingMessage();
    this.showValidationErrors = false;

    if (this.isGeneralEditor) {
      if (this.isNewUser) {
        this.alertService.showMessage('Success', `User \"${this.user.userName}\" was created successfully`, MessageSeverity.success);
      }
      else if (!this.isEditingSelf) {
        this.alertService.showMessage('Success', `Changes to user \"${this.user.userName}\" was saved successfully`,
          MessageSeverity.success);
      }
    }

    if (this.isEditingSelf) {
      this.alertService.showMessage('Success', 'Changes to your User Profile was saved successfully', MessageSeverity.success);
      }

    this.isEditMode = false;


    if (this.changesSavedCallback)
      this.changesSavedCallback();
  }


  private saveFailedHelper(error: any) {
    this.isSaving = false;
    this.alertService.stopLoadingMessage();
    this.alertService.showStickyMessage('Save Error', 'The below errors occured whilst saving your changes:', MessageSeverity.error, error);
    this.alertService.showStickyMessage(error, null, MessageSeverity.error);

    if (this.changesFailedCallback)
      this.changesFailedCallback();
  }
















}
