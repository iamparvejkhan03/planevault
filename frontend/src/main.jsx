import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PopUpContextProvider } from './contexts/PopUpContextProvider';
import { Protected, LoadingSpinner, AdminRoute } from './components';
import { AuthProvider } from './contexts/AuthContext.jsx';

const Home = lazy(() => import('./pages/Home'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Auctions = lazy(() => import('./pages/Auctions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse'));
const PaymentRefundPolicy = lazy(() => import('./pages/PaymentRefundPolicy'));
const SellerAgreement = lazy(() => import('./pages/SellerAgreement'));
const BuyerAgreement = lazy(() => import('./pages/BuyerAgreement'));
const SingleAuction = lazy(() => import('./pages/SingleAuction'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

{/* Seller Pages */ }
const SellerLayout = lazy(() => import('./pages/seller/Layout'));
const SellerDashboard = lazy(() => import('./pages/seller/Dashboard'));
const CreateAuction = lazy(() => import('./pages/seller/CreateAuction'));
const EditAuction = lazy(() => import('./pages/seller/EditAuction'));
const SellerAllAuctions = lazy(() => import('./pages/seller/AllAuctions'));
const SoldAuctions = lazy(() => import('./pages/seller/SoldAuctions'));
const BidHistory = lazy(() => import('./pages/seller/BidHistory'));
const SellerProfile = lazy(() => import('./pages/seller/Profile'));
const SellerNotifications = lazy(() => import('./pages/seller/Notifications'));

{/* Bidder Pages */ }
const BidderLayout = lazy(() => import('./pages/bidder/Layout'));
const BidderDashboard = lazy(() => import('./pages/bidder/Dashboard'));
const Watchlist = lazy(() => import('./pages/bidder/Watchlist'));
const ActiveAuctions = lazy(() => import('./pages/bidder/ActiveAuctions'));
const MyBids = lazy(() => import('./pages/bidder/MyBids'));
const WonAuctions = lazy(() => import('./pages/bidder/WonAuctions'));
const BidderProfile = lazy(() => import('./pages/bidder/Profile'));
const BidderNotifications = lazy(() => import('./pages/bidder/Notifications'));

{/* Admin Pages */ }
const AdminLayout = lazy(() => import('./pages/admin/Layout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AllUsers = lazy(() => import('./pages/admin/AllUsers'));
const AdminAllAuctions = lazy(() => import('./pages/admin/AllAuctions'));
const AdminEditAuction = lazy(() => import('./pages/admin/EditAuction'));
const UserQueries = lazy(() => import('./pages/admin/UserQueries'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));
const AdminProfile = lazy(() => import('./pages/admin/Profile'));
const AdminComments = lazy(() => import('./pages/admin/Comments'));
const Commissions = lazy(() => import('./pages/admin/Commissions'));
const AdminBidHistory = lazy(() => import('./pages/admin/BidHistory'));
const Transactions = lazy(() => import('./pages/admin/Transactions'));

createRoot(document.getElementById('root')).render(
    //<StrictMode>
        <AuthProvider>
            <PopUpContextProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<App />}>
                            <Route path='' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Home /></Suspense>} />

                            <Route path='/contact' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Contact /></Suspense>} />

                            <Route path='/about' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><About /></Suspense>} />

                            <Route path='/login' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Login /></Suspense>} />

                            <Route path='/register' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Register /></Suspense>} />

                            <Route path='/auctions' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><Auctions /></Suspense>} />

                            <Route path='/auction/:id' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><SingleAuction /></Suspense>} />

                            <Route path='/privacy-policy' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><PrivacyPolicy /></Suspense>} />

                            <Route path='/terms-of-use' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><TermsOfUse /></Suspense>} />

                            <Route path='/payment-refund-policy' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><PaymentRefundPolicy /></Suspense>} />

                            <Route path='/seller-agreement' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><SellerAgreement /></Suspense>} />

                            <Route path='/buyer-agreement' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><BuyerAgreement /></Suspense>} />

                            <Route path='/reset-password' index={true} element={<Suspense fallback={<LoadingSpinner height={'725px'} />}><ResetPassword /></Suspense>} />
                        </Route>

                        {/* Seller Layout */}
                        <Route path='/seller' element={<Protected authetication={true} userType='seller'><SellerLayout /></Protected>}>
                            {/* Seller Dashboard */}
                            <Route
                                path='/seller/dashboard'
                                index={true}
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerDashboard />
                                    </Suspense>
                                }
                            />
                            {/* Seller Create Auction */}
                            <Route
                                path='/seller/auctions/create'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <CreateAuction />
                                    </Suspense>
                                }
                            />
                            {/* Seller Edit Auction */}
                            <Route
                                path='/seller/auctions/edit/:auctionId'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <EditAuction />
                                    </Suspense>
                                }
                            />
                            {/* Seller Live Auctions */}
                            <Route
                                path='/seller/auctions/all'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerAllAuctions />
                                    </Suspense>
                                }
                            />
                            {/* Seller Won Auctions */}
                            <Route
                                path='/seller/auctions/sold'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SoldAuctions />
                                    </Suspense>
                                }
                            />
                            {/* Seller Auctions Bid History */}
                            <Route
                                path='/seller/bids/history'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidHistory />
                                    </Suspense>
                                }
                            />
                            {/* Seller Profile */}
                            <Route
                                path='/seller/profile'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerProfile />
                                    </Suspense>
                                }
                            />
                            {/* Seller Notifications */}
                            <Route
                                path='/seller/notifications'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <SellerNotifications />
                                    </Suspense>
                                }
                            />
                        </Route>

                        {/* Bidder Layout */}
                        <Route path='/bidder' element={<Protected authetication={true} userType='bidder'><BidderLayout /></Protected>}>
                            {/* Bidder Dashboard */}
                            <Route
                                path='/bidder/dashboard'
                                index={true}
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderDashboard />
                                    </Suspense>
                                }
                            />

                            {/* Bidder Watchlist */}
                            <Route
                                path='/bidder/watchlist'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <Watchlist />
                                    </Suspense>
                                }
                            />

                            {/* Bidder Watchlist */}
                            <Route
                                path='/bidder/auctions/active'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <ActiveAuctions />
                                    </Suspense>
                                }
                            />

                            {/* Bidder My Bids */}
                            <Route
                                path='/bidder/bids'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <MyBids />
                                    </Suspense>
                                }
                            />

                            {/* Bidder My Bids */}
                            <Route
                                path='/bidder/auctions/won'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <WonAuctions />
                                    </Suspense>
                                }
                            />
                            {/* Bidder Profile */}
                            <Route
                                path='/bidder/profile'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderProfile />
                                    </Suspense>
                                }
                            />

                            {/* Bidder Notifications */}
                            <Route
                                path='/bidder/notifications'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <BidderNotifications />
                                    </Suspense>
                                }
                            />
                        </Route>

                        {/* Admin Layout */}
                        <Route path='/admin' element={<Protected authetication={true} userType='admin'><AdminLayout /></Protected>} >
                            {/* Admin Dashboard */}
                            <Route
                                path='/admin/dashboard'
                                index={true}
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminDashboard />
                                    </Suspense>
                                }
                            />

                            {/* Admin All Users */}
                            <Route
                                path='/admin/users'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AllUsers />
                                    </Suspense>
                                }
                            />

                            {/* Admin All Auctions */}
                            <Route
                                path='/admin/auctions/all'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminAllAuctions />
                                    </Suspense>
                                }
                            />

                            {/* Admin Edit Auction */}
                            <Route
                                path='/admin/auctions/edit/:auctionId'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminEditAuction />
                                    </Suspense>
                                }
                            />

                            {/* Admin Support */}
                            <Route
                                path='/admin/support/inquiries'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <UserQueries />
                                    </Suspense>
                                }
                            />

                            {/* Admin Support */}
                            <Route
                                path='/admin/notifications'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminNotifications />
                                    </Suspense>
                                }
                            />

                            {/* Admin Profile */}
                            <Route
                                path='/admin/profile'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminProfile />
                                    </Suspense>
                                }
                            />

                            {/* Admin Profile */}
                            <Route
                                path='/admin/comments'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminComments />
                                    </Suspense>
                                }
                            />

                            {/* Admin Profile */}
                            <Route
                                path='/admin/commissions'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <Commissions />
                                    </Suspense>
                                }
                            />

                            {/* Admin Profile */}
                            <Route
                                path='/admin/bids'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <AdminBidHistory />
                                    </Suspense>
                                }
                            />

                            {/* Admin Profile */}
                            <Route
                                path='/admin/transactions'
                                element={
                                    <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                        <Transactions />
                                    </Suspense>
                                }
                            />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </PopUpContextProvider>
        </AuthProvider>
    //</StrictMode>,
)
