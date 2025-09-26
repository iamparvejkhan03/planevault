import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PopUpContextProvider } from './contexts/popups/index.jsx';
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

{/* Seller Pages */ }
const SellerLayout = lazy(() => import('./pages/seller/Layout'));
const SellerDashboard = lazy(() => import('./pages/seller/Dashboard'));
const CreateAuction = lazy(() => import('./pages/seller/CreateAuction'));
const EditAuction = lazy(() => import('./pages/seller/EditAuction'));
const SellerAllAuctions = lazy(() => import('./pages/seller/AllAuctions'));
const SellerWonAuctions = lazy(() => import('./pages/seller/WonAuctions'));
const BidHistory = lazy(() => import('./pages/seller/BidHistory'));
const SellerProfile = lazy(() => import('./pages/seller/Profile'));
const SellerNotifications = lazy(() => import('./pages/seller/Notifications'));

{/* Bidder Pages */ }
const BidderLayout = lazy(() => import('./pages/bidder/Layout'));
const BidderDashboard = lazy(() => import('./pages/bidder/Dashboard'));
const Watchlist = lazy(() => import('./pages/bidder/Watchlist'));
const ActiveAuctions = lazy(() => import('./pages/bidder/ActiveAuctions'));
const MyBids = lazy(() => import('./pages/bidder/MyBids'));
const BidderWonAuctions = lazy(() => import('./pages/bidder/WonAuctions'));
const BidderProfile = lazy(() => import('./pages/bidder/Profile'));
const BidderNotifications = lazy(() => import('./pages/bidder/Notifications'));

{/* Admin Pages */ }
const AdminLayout = lazy(() => import('./pages/admin/Layout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AllUsers = lazy(() => import('./pages/admin/AllUsers'));
const AdminAllAuctions = lazy(() => import('./pages/admin/AllAuctions'));
const UserQueries = lazy(() => import('./pages/admin/UserQueries'));
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'));

createRoot(document.getElementById('root')).render(
    <StrictMode>
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
                        </Route>

                        {/* Seller Layout */}
                        <Route path='/seller' element={<SellerLayout />}>
                            {/* Seller Dashboard */}
                            <Route
                                path='/seller/dashboard'
                                index={true}
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <SellerDashboard />
                                        </Suspense>
                                    </Protected>
                                }
                            />
                            {/* Seller Create Auction */}
                            <Route
                                path='/seller/auctions/create'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <CreateAuction />
                                        </Suspense>
                                    </Protected>
                                }
                            />
                            {/* Seller Edit Auction */}
                            <Route
                                path='/seller/auctions/edit/:auctionId'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <EditAuction />
                                        </Suspense>
                                    </Protected>
                                }
                            />
                            {/* Seller Live Auctions */}
                            <Route
                                path='/seller/auctions/all'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <SellerAllAuctions />
                                        </Suspense>
                                    </Protected>
                                }
                            />
                            {/* Seller Won Auctions */}
                            <Route
                                path='/seller/auctions/won'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <SellerWonAuctions />
                                        </Suspense>
                                    </Protected>
                                }
                            />
                            {/* Seller Auctions Bid History */}
                            <Route
                                path='/seller/bids/history'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <BidHistory />
                                        </Suspense>
                                    </Protected>
                                }
                            />
                            {/* Seller Profile */}
                            <Route
                                path='/seller/profile'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <SellerProfile />
                                        </Suspense>
                                    </Protected>
                                }
                            />
                            {/* Seller Notifications */}
                            <Route
                                path='/seller/notifications'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <SellerNotifications />
                                        </Suspense>
                                    </Protected>
                                }
                            />
                        </Route>

                        {/* Bidder Layout */}
                        <Route path='/bidder' element={<BidderLayout />}>
                            {/* Bidder Dashboard */}
                            <Route
                                path='/bidder/dashboard'
                                index={true}
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <BidderDashboard />
                                        </Suspense>
                                    </Protected>
                                }
                            />

                            {/* Bidder Watchlist */}
                            <Route
                                path='/bidder/watchlist'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <Watchlist />
                                        </Suspense>
                                    </Protected>
                                }
                            />

                            {/* Bidder Watchlist */}
                            <Route
                                path='/bidder/auctions/active'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <ActiveAuctions />
                                        </Suspense>
                                    </Protected>
                                }
                            />

                            {/* Bidder My Bids */}
                            <Route
                                path='/bidder/bids'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <MyBids />
                                        </Suspense>
                                    </Protected>
                                }
                            />

                            {/* Bidder My Bids */}
                            <Route
                                path='/bidder/auctions/won'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <BidderWonAuctions />
                                        </Suspense>
                                    </Protected>
                                }
                            />
                            {/* Bidder Profile */}
                            <Route
                                path='/bidder/profile'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <BidderProfile />
                                        </Suspense>
                                    </Protected>
                                }
                            />

                            {/* Bidder Notifications */}
                            <Route
                                path='/bidder/notifications'
                                element={
                                    <Protected authetication={true}>
                                        <Suspense fallback={<LoadingSpinner height={'750px'} />}>
                                            <BidderNotifications />
                                        </Suspense>
                                    </Protected>
                                }
                            />
                        </Route>

                        {/* Admin Layout */}
                        <Route path='/admin' element={<AdminRoute><AdminLayout /></AdminRoute>} >
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
                        </Route>
                    </Routes>
                </BrowserRouter>
            </PopUpContextProvider>
        </AuthProvider>
    </StrictMode>,
)
