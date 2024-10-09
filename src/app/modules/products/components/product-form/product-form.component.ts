import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';
import { CategoriesService } from './../../../../services/categories/categories.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { GetCategoriesResponses } from 'src/app/models/interfaces/categories/GetCategoriesResponse';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { EditProductRequest } from 'src/app/models/interfaces/products/request/EditProductRequest';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductEvent } from 'src/app/models/enums/products/ProductEvent';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: [],
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private readonly destroy$: Subject<void> = new Subject<void>();
  public categoriesData: Array<GetCategoriesResponses> = [];
  public selectedCategory: Array<{ name: string; code: string }> = [];
  public productAction!: { event: EventAction; productsDatas: Array<GetAllProductsResponse> };
  public productsDatas: Array<GetAllProductsResponse> = [];
  public addProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', Validators.required],
    amount: [0, Validators.required],
    category_id: ['', Validators.required],
  });

  public editProductForm = this.formBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    amount: [0, Validators.required],
    category_id: ['', Validators.required],
  });

  public renderDropdown = false;

  public addProductAction = ProductEvent.ADD_PRODUCT_EVENT;
  public editProductAction = ProductEvent.EDIT_PRODUCT_EVENT;
  public saleProductAction = ProductEvent.SALE_PRODUCT_EVENT;

  constructor(
    private categoriesService: CategoriesService,
    private productsService: ProductsService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    public ref: DynamicDialogConfig,
    private productsDataTransferService: ProductsDataTransferService
  ) {}

  ngOnInit(): void {

    this.productAction = this.ref.data;

    if(this.productAction?.event?.action === this.saleProductAction){
      this.getProductDatas();
    }
    this.getAllCategories();
    this.renderDropdown = true;
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
            if(this.productAction?.event?.action === this.editProductAction && this.productAction?.productsDatas){
              this.getProductSelectedDatas(this.productAction?.event?.id as string);
            }
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

  handleSubmitEditProduct(): void {
    if(this.editProductForm.value && this.editProductForm.valid && this.productAction?.event?.id){
      const requestEditProduct: EditProductRequest = {
        name: this.editProductForm.value.name as string,
        price: this.editProductForm.value.price as string,
        description: this.editProductForm.value.description as string,
        amount: Number(this.editProductForm.value.amount),
        product_id: this.productAction?.event?.id as string,
        category_id: this.editProductForm.value.category_id as string,
      };
      this.productsService.editProduct(requestEditProduct)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Produto editado com sucesso!',
            life: 2500,
          });
          this.editProductForm.reset();
        },
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Algo deu erro ao editar o produto!',
          });
          this.editProductForm.reset();
        },
      });
    }
  }

  getProductSelectedDatas(productId: string): void {
    const allProducts = this.productAction?.productsDatas;
    if(allProducts.length > 0){
      const productSelected = allProducts.find((product) => product.id === productId);
      if(productSelected){
        this.editProductForm.patchValue({
          name: productSelected.name,
          price: productSelected.price,
          description: productSelected.description,
          amount: productSelected.amount,
          category_id: productSelected.category.id
        });
      }
    }
  }

  getProductDatas(): void {
    this.productsService.getAllProducts()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if(response.length > 0){
          this.productsDatas = response;
          this.productsDatas && this.productsDataTransferService.setProductsDatas(response);
        }
      },
      error: (error) => {
        console.log(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Algo deu errado ao carregar os produtos!',
        });
    }});
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
