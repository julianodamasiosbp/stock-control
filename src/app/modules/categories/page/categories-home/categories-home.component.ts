import { ConfirmationService, MessageService } from 'primeng/api';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GetCategoriesResponses } from 'src/app/models/interfaces/categories/GetCategoriesResponse';

@Component({
  selector: 'app-categories-home',
  templateUrl: './categories-home.component.html',
  styleUrls: []
})
export class CategoriesHomeComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject();
  public categoriesDatas: Array<GetCategoriesResponses> = [];

  constructor(private categoriesService: CategoriesService,
    private dialogService: DialogService,
    private MessageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getAllCategories();
  }

  getAllCategories() {
    this.categoriesService.getAllCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if(response.length > 0) {
        this.categoriesDatas = response;
        }
      },
      error: (error) => {
        console.error(error);
        this.MessageService.add({severity:'error', summary:'Erro', detail:'Erro ao buscar categorias', life: 3000});
        this.router.navigate(['/dashboard']);
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
