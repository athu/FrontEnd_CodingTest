import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { HeaderMail, Mail } from 'app/main/apps/mail/mail.model';
import { MailService } from 'app/main/apps/mail/mail.service';
import { CompileShallowModuleMetadata, ThrowStmt } from '@angular/compiler';

import { HttpClient } from '@angular/common/http';
import { FuseUtils } from '@fuse/utils';
import { environment } from 'environments/environment';
import { TypographyBlockquotesListsComponent } from '@/main/ui/typography/tabs/blockquotes-lists/blockquotes-lists.component';
@Component({
    selector     : 'mail-list',
    templateUrl  : './mail-list.component.html',
    styleUrls    : ['./mail-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class MailListComponent implements OnInit, OnDestroy
{
    mails: Mail[];
    currentMail: Mail;

    config:any;
    totalRows : number;
    pageNumber: number;
    rowsOfPage: number;
    folderId : number;
    // Private
    private _unsubscribeAll: Subject<any>;
    searchText = '';
    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {MailService} _mailService
     * @param {Location} _location
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _mailService: MailService,
        private _location: Location
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to update mails on changes
         this._mailService.onMailsChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(mails => {
                
                this.mails = mails.results;
                this.totalRows =  mails.totalRows;
                this.pageNumber = mails.pageNumber;
                this.rowsOfPage = mails.rowsOfPage;
                this.folderId = mails.folderId;

                this.config = {
                    itemsPerPage: this.rowsOfPage,
                    currentPage: this.pageNumber,
                    totalItems: this.totalRows
                  };

                  this._mailService.onCurrentMailChanged.next(null);
            });
            
        // Subscribe to update current mail on changes
        this._mailService.onCurrentMailChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(currentMail => {
                
                if ( !currentMail )
                {
                    // Set the current mail id to null to deselect the current mail
                    this.currentMail = null;

                    // Handle the location changes
                    const labelHandle  = this._activatedRoute.snapshot.params.labelHandle,
                          filterHandle = this._activatedRoute.snapshot.params.filterHandle,
                          folderHandle = this._activatedRoute.snapshot.params.folderHandle;

                    if ( labelHandle )
                    {
                        this._location.go('apps/mail/label/' + labelHandle);
                    }
                    else if ( filterHandle )
                    {
                        this._location.go('apps/mail/filter/' + filterHandle);
                    }
                    else
                    {
                        this._location.go('apps/mail/' + folderHandle);                        
                    }
                }
                else
                {
                    this.currentMail = currentMail;
                }
            });
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Read mail
     *
     * @param mailId
     */
    readMail(mailId): void
    {
        const labelHandle  = this._activatedRoute.snapshot.params.labelHandle,
              filterHandle = this._activatedRoute.snapshot.params.filterHandle,
              folderHandle = this._activatedRoute.snapshot.params.folderHandle;
        if ( labelHandle )
        {
            this._location.go('apps/mail/label/' + labelHandle + '/' + mailId);
        }
        else if ( filterHandle )
        {
            this._location.go('apps/mail/filter/' + filterHandle + '/' + mailId);
        }
        else
        {
             this._location.go('apps/mail/' + folderHandle + '/' + mailId);
        }
        // Set current mail
        this._mailService.setCurrentMail(mailId);
    }

    pageChangeEvent(event: number)
    {
            const pageNumber = event;
            this._mailService.getMailsByFolder(this._activatedRoute.snapshot.params.folderHandle,pageNumber );
             this.config = {
                itemsPerPage: this.rowsOfPage,
                currentPage: pageNumber,
                totalItems: this.totalRows
              };    
    }
}
