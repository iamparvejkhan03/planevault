import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const TermsOfUse = () => {
    return (
        <section className="pt-32 pb-10 text-gray-800">
            <Container>
                <h1 className="text-4xl md:text-5xl font-bold my-5 text-black">Terms of Use</h1>

                <p className="mb-2">Effective Date: September 14, 2025</p>
                <p className="mb-4">Last Updated: September 14, 2025</p>
                <p className="mb-4">
                    Welcome to Plane Vault ("we," "our," "us"). These Terms of Use ("Terms") govern your access to and
                    use of the Plane Vault website, services, listings, and auction-style listings (collectively, the "Services").
                    By accessing or using the Services, you agree to be bound by these Terms. If you do not agree, you
                    must not use the Services.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">1. Eligibility</h2>
                <ul className="mb-4">
                    <li>- You must be at least 18 years old and legally able to enter into binding contracts.</li>
                    <li>- By using Plane Vault, you represent that you meet all eligibility requirements.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">2. Platform Nature of Services</h2>
                <div className="mb-4">
                    <p>- Plane Vault is an online marketplace that connects sellers and buyers of aircraft and aviation-related assets.</p>
                    <p>- We are not a party to any transaction between users. All purchases, sales, and agreements are solely between the buyer and seller.</p>
                    <p>- Plane Vault does not endorse, guarantee, or verify any listing, buyer, or seller.</p>
                    <p className="mt-2 font-semibold">Important:</p>
                    <p>
                        Plane Vault is not an auctioneer and does not conduct auctions as defined under Florida law. We provide a technology platform
                        where sellers can post listings that may include bidding features or auction-style formats. All transactions are solely between buyers and sellers.
                    </p>
                </div>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">3. User Accounts</h2>
                <ul className="mb-4">
                    <li>- To participate in bidding-style listings, you must create an account and provide accurate, complete information.</li>
                    <li>- You are responsible for maintaining the confidentiality of your login credentials.</li>
                    <li>- You are responsible for all activity under your account.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">4. Bidding Rules</h2>
                <ul className="mb-4">
                    <li>- Bids placed on a listing are binding offers to purchase.</li>
                    <li>- Sellers are responsible for ensuring that their listings are accurate, complete, and lawful.</li>
                    <li>- Buyers are responsible for conducting their own due diligence before placing a bid.</li>
                    <li>- Plane Vault may, at its discretion, cancel, remove, or reject any listing or bid.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">5. Fees & Payments</h2>
                <ul className="mb-4">
                    <li>- Use of certain features may require payment of fees (listing fees, buyer’s premium, etc.).</li>
                    <li>- Fees will be disclosed prior to use and are non-refundable unless otherwise stated.</li>
                    <li>- Payment processing may be handled by third-party providers; by using our Services, you agree to their terms as well.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">6. Listings, Content, and Intellectual Property</h2>
                <div className="mb-4">
                    <p>- Plane Vault does not verify the accuracy of any listing, description, or representation made by users.</p>
                    <p>- All aircraft and items are sold "as is, where is."</p>
                    <p>- Plane Vault makes no guarantees regarding airworthiness, condition, title, or legality of any listed aircraft.</p>
                    <p>- Users retain rights to their content but grant Plane Vault a license to display and use it on the platform.</p>
                    <p>- If you believe content on Plane Vault infringes your intellectual property rights, you may submit a takedown request under our DMCA procedure.</p>
                </div>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">7. FAA-Related Disclosures</h2>
                <div className="mb-4">
                    <p>- Sellers must provide FAA Registration, Airworthiness Certificate (as applicable), and maintenance records/logbooks.</p>
                    <p>- Buyers acknowledge aircraft must be re-registered with the FAA and are responsible for all FAA filings.</p>
                    <p>- Plane Vault does not verify airworthiness and is not responsible for FAA compliance; buyers must conduct their own conformity checks.</p>
                </div>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">8. Prohibited Conduct</h2>
                <p className="mb-4">
                    You agree not to:
                </p>
                <ul className="mb-4">
                    <li>- Use the Services for unlawful purposes.</li>
                    <li>- Misrepresent yourself, your aircraft, or your ability to complete a transaction.</li>
                    <li>- Manipulate listings, bids, or pricing.</li>
                    <li>- Upload harmful, infringing, or fraudulent content.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">9. Limitation of Liability</h2>
                <div className="mb-4">
                    <p>- Plane Vault is not responsible for any damages, losses, or disputes arising from transactions between buyers and sellers.</p>
                    <p>- To the fullest extent permitted by law, Plane Vault disclaims all liability for any indirect, incidental, or consequential damages.</p>
                    <p>- Your sole remedy is to stop using the Services.</p>
                </div>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">10. Indemnification</h2>
                <p className="mb-4">
                    You agree to indemnify and hold harmless Plane Vault, its owners, officers, employees, and affiliates
                    from any claims, damages, or expenses arising from your use of the Services or violation of these Terms.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">11. Termination</h2>
                <ul className="mb-4">
                    <li>- We reserve the right to suspend or terminate your account at any time, without notice, if you violate these Terms.</li>
                    <li>- Upon termination, you must cease all use of the Services.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">12. Governing Law & Disputes</h2>
                <div className="mb-4">
                    <p>- These Terms are governed by the laws of the State of Florida, without regard to its conflict of law provisions.</p>
                    <p>- Any disputes shall be resolved through binding arbitration under Florida law, except claims that may be brought in small claims court.</p>
                    <p>- By using Plane Vault, you waive your right to a jury trial.</p>
                </div>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">13. Amendments</h2>
                <p className="mb-4">
                    Plane Vault may update these Terms at any time. Changes will be communicated through our website
                    or by email. Continued use after notice constitutes acceptance. If you do not agree, you must stop
                    using the Services.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">14. Survival</h2>
                <p className="mb-4">
                    Sections regarding Limitation of Liability, Indemnification, Governing Law, Disputes, and Survival shall
                    remain in effect even after account termination.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">15. Contact Us</h2>
                <p className="mb-4">
                    Plane Vault <br />
                    {otherData.address} <br />
                    <Link className="text-blue-600 underline" to={`mailto:${otherData.email}`}>{otherData.email}</Link> <br />
                    <Link className="text-blue-600 underline" to={`tel:${otherData.phone}`}>{otherData.phone}</Link>
                </p>
            </Container>
        </section>
    );
};

export default TermsOfUse;