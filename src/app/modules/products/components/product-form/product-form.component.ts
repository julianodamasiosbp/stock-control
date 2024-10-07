import { CategoriesService } from './../../../../services/categories/categories.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { GetCategoriesResponses } from 'src/app/models/interfaces/categories/GetCategoriesResponse';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { ProductsService } from 'src/app/services/products/products.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: [],
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject<void>();
  public categoriesData: Array<GetCategoriesResponses> = [];
  public selectedCategory: Array<{ name: string; code: string }> = [];
  public addProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', Validators.required],
    amount: [0, Validators.required],
    category_id: ['', Validators.required],
  });

  constructor(
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllCategories();
  }
  onSubmit() {
    throw new Error('Method not implemented.');
  }

  getAllCategories(): void {
    this.categoriesService
      .getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.categoriesData = response;
          }
        },
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Algo deu erro ao carregar as categorias!',
          });
        },
      });
  }

  handleSubmitAddProduct(): void {
    if (this.addProductForm?.value && this.addProductForm?.valid) {
      const requestCreateProduct: CreateProductRequest = {
        name: this.addProductForm.value.name as string,
        price: this.addProductForm.value.price as string,
        description: this.addProductForm.value.description as string,
        category_id: this.addProductForm.value.category_id as string,
        amount: Number(this.addProductForm.value.amount),
      };
      this.productsService.createProduct(requestCreateProduct)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if(response){
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto cadastrado com sucesso!',
            life: 2500,
          });
          this.router.navigate(['/products']);
        }},
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Algo deu erro ao cadastrar o produto!',
          });
        },
      });
    }
    this.addProductForm.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
