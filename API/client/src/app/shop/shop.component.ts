import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IBrand } from '../shared/models/brand';
import { IPagination } from '../shared/models/pagination';
import { IProduct } from '../shared/models/product';
import { IType } from '../shared/models/productType';
import { ShopParams } from '../shared/models/shopParams';
import { ShopService } from './shop.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {
  @ViewChild('search') searchTerm?: ElementRef;
  products: IProduct[] = [];
  brands: IBrand[] =[];
  types: IType[] =[];
  shopParams = new ShopParams();
  totalCount: number = 50;
  sortOptions = [
    {name: 'Alphabetical', value: 'name'},
    {name: 'Price: Low to High', value: 'priceAsc'},
    {name: 'Price: High to Low', value: 'priceDesc'}
  ]

  constructor(private shopService: ShopService){ }

  ngOnInit(): void {
   this.getProducts();
   this.getBrands();
   this.getTypes();
  }

  getProducts(){
    this.shopService.getProducts(this.shopParams).subscribe({
      next: (response : IPagination | null) => {
        this.products = response!.data;
        this.shopParams.pageNumber = response!.pageIndex;
        this.shopParams.pageSize = response!.pageSize;
        this.totalCount = response!.count;
        //this.totalCount = response!.data.length;
        console.log(response);
      },
      error: (err : Error) => console.log(err),
      complete: () => console.log('completed')
  });
  }

  getBrands(){
    this.shopService.getBrands().subscribe({
      next: (response : IBrand[]) => {
        this.brands = [{id: 0, name: "All"}, ...response]},
      error: (err : Error) => console.log(err),
      complete: () => console.log('completed')
  });
  }

  getTypes(){
    this.shopService.getTypes().subscribe({
      next: (response : IType[]) => {
        this.types = [{id: 0, name: "All"}, ...response]},
      error: (err : Error) => console.log(err),
      complete: () => console.log('completed')
  });
  }

  onBrandSelected(brandId: number){
    this.shopParams.brandId = brandId;
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  onTypeSelected(typeId:number){
    this.shopParams.typeId = typeId;
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  onSortSelected(sort: string){
    this.shopParams.sort = sort;
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  onPageChanged(event: any){
    if (this.shopParams.pageNumber !== event) {
    this.shopParams.pageNumber = event;
    this.getProducts();
    }
  }

  onSearch(){
    this.shopParams.search = this.searchTerm?.nativeElement.value;
    this.getProducts();
  }

  onReset() {
    if (this.searchTerm) this.searchTerm.nativeElement.value = '';
    this.shopParams = new ShopParams();
    this.getProducts();
  }


}
