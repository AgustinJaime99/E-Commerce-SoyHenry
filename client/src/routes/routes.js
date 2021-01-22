import React from 'react';
import { Route } from 'react-router-dom';
import Catalog from "../components/catalog/Catalog";
import SearchBar from '../components/searchbar/SearchBar';
import ProductDetail from '../components/productDetail/ProductDetail';

const routes = () => {
    return (
      <>
      <Route path="/" component={SearchBar} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/products" component={Catalog} />
      <Route path="/product/:id" component={ProductDetail} />
      </>
    );
}

export default routes;