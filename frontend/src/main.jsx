import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingSpinner from './components/LoadingSpinner.jsx';
import { PopUpContextProvider } from './contexts/popups/index.jsx';

const Home = lazy(() => import('./pages/Home'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const PaymentRefundPolicy = lazy(() => import('./pages/PaymentRefundPolicy'));
const SellerAgreement = lazy(() => import('./pages/SellerAgreement'));
const BuyerAgreement = lazy(() => import('./pages/BuyerAgreement'));
const SingleAuction = lazy(() => import('./pages/SingleAuction'));

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <PopUpContextProvider>
            <BrowserRouter>
                <Routes>
                    <Route path='/' element={<App />}>
                        <Route path='' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Home /></Suspense>} />

                        <Route path='/contact' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Contact /></Suspense>} />

                        <Route path='/about' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><About /></Suspense>} />

                        <Route path='/auction/:auctionId' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><SingleAuction /></Suspense>} />

                        <Route path='/privacy-policy' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><PrivacyPolicy /></Suspense>} />

                        <Route path='/terms-of-use' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><TermsOfUse /></Suspense>} />

                        <Route path='/payment-refund-policy' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><PaymentRefundPolicy /></Suspense>} />

                        <Route path='/seller-agreement' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><SellerAgreement /></Suspense>} />

                        <Route path='/buyer-agreement' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><BuyerAgreement /></Suspense>} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </PopUpContextProvider>
    </StrictMode>,
)
