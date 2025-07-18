import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AppLayout from "./layout/AppLayout";
import AuthLayout from "./layout/AuthLayout";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Ecommerce from "./pages/Dashboard/ECommerce";
import NotFound from "./pages/OtherPage/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import BlogList from "./pages/Blog/BlogList";
import BlogForm from "./pages/Blog/BlogForm";
import BlogDetail from "./pages/Blog/BlogDetail";
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import ProductDetail from './pages/Products/ProductDetail';
import ServiceList from './pages/Services/ServiceList';
import ServiceForm from './pages/Services/ServiceForm';
import ServiceDetail from './pages/Services/ServiceDetail';
import MessageList from "./pages/Messages/MessageList";
import SupplierList from './pages/Suppliers/SupplierList';
import SupplierDetail from './pages/Suppliers/SupplierDetail';
import BrandList from './pages/Brands/BrandList';
import BrandForm from './pages/Brands/BrandForm';
import CategoryList from './pages/Categories/CategoryList';
import CategoryForm from './pages/Categories/CategoryForm';
import SubCategoryForm from './pages/Categories/SubCategoryForm';


export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Auth Layout - Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          {/* Protected Dashboard Layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            {/* Main Dashboard */}
            <Route index element={<Ecommerce />} />

            {/* Blog Routes */}
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/add" element={<BlogForm mode='add' />} />
            <Route path="/blog/edit/:id" element={<BlogForm mode='edit' />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />

            {/* Products Routes */}
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/add" element={<ProductForm />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/products/:id/edit" element={<ProductForm />} />

            {/* Services Routes */}
            <Route path="/services" element={<ServiceList />} />
            <Route path="/services/add" element={<ServiceForm />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/services/:id/edit" element={<ServiceForm />} />

            {/* Supplier Routes */}
            <Route path="/suppliers" element={<SupplierList />} />
            <Route path="/suppliers/:id" element={<SupplierDetail />} />

            {/* Brand Routes */}
            <Route path="/brands" element={<BrandList />} />
            <Route path="/brands/add" element={<BrandForm mode='add' />} />
            <Route path="/brands/:id/edit" element={<BrandForm mode='edit' />} />

            {/* Category Routes */}
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/categories/add" element={<CategoryForm mode='add' />} />
            <Route path="/categories/:id/edit" element={<CategoryForm mode='edit' />} />

            {/* Subcategory Routes */}
            <Route path="/subcategories" element={<CategoryList isSubcategoryList={true} />} />
            <Route path="/subcategories/add" element={<SubCategoryForm mode='add' />} />
            <Route path="/subcategories/:id/edit" element={<SubCategoryForm mode='edit' />} />

            <Route path="/messages" element={<MessageList/>}/>
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </Provider>
  );
}
