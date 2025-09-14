import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const PaymentRefundPolicy = () => {
    return (
        <section className="pt-32 pb-10 text-gray-800">
            <Container>
                <h1 className="text-4xl md:text-5xl font-bold my-5 text-black">Payment & Refund Policy</h1>

                <p className="mb-2">Effective Date: September 14, 2025</p>
                <p className="mb-4">Last Updated: September 14, 2025</p>
                <p className="mb-4">
                    This Payment & Refund Policy governs fees, deposits, payments, and refunds on Plane Vault.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">1. Payment Methods</h2>
                <ul className="mb-4">
                    <li>- Supported methods: credit/debit cards, bank transfer, escrow, or other methods through third parties.</li>
                    <li>- Payment information is processed securely by third-party providers; we do not store sensitive payment details.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">2. Deposits & Holds</h2>
                <ul className="mb-4">
                    <li>- Plane Vault may require deposits or credit card holds to secure bids.</li>
                    <li>- Holds are released if you are not the winning bidder; winning bidders may have deposits applied to fees or forfeited if obligations are not met.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">3. Fees</h2>
                <ul className="mb-4">
                    <li>- Listing fees: non-refundable once a listing goes live.</li>
                    <li>- Buyer’s premium: added to the winning bid, payable to Plane Vault.</li>
                    <li>- Optional services (promotions, featured listings) are disclosed upfront and non-refundable.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">4. Winning Bid Obligations</h2>
                <ul className="mb-4">
                    <li>- Winning bidders are legally obligated to complete the purchase.</li>
                    <li>- Sellers are bound to honor winning bids if reserve (if any) is met.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">5. Refunds</h2>
                <ul className="mb-4">
                    <li>- No refunds for listing fees, buyer’s premiums, or completed transactions.</li>
                    <li>- Deposits refundable only if not the winner or if listing canceled.</li>
                    <li>- Verified payment errors will be corrected.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">6. Taxes & Compliance</h2>
                <p className="mb-4">
                    Buyers and sellers are responsible for taxes, registration, FAA filing, and related regulatory fees.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">7. Disputes</h2>
                <p className="mb-4">
                    All disputes are between buyer and seller; Plane Vault is not a party. Plane Vault is not liable for refunds or enforcement of private agreements.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">8. Escrow & FAA Compliance</h2>
                <p className="mb-4">
                    For high-value transactions, Plane Vault may require use of FAA-approved escrow/title companies. Buyers and sellers are responsible for escrow fees.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">9. Limitation of Liability</h2>
                <p className="mb-4">
                    Plane Vault disclaims liability for financial losses, chargebacks, or disputes arising from transactions.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">10. Amendments</h2>
                <p className="mb-4">
                    We may update this Policy at any time. Continued use constitutes acceptance.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">11. Governing Law</h2>
                <p className="mb-4">
                    This Policy is governed by Florida law.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">Contact</h2>
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

export default PaymentRefundPolicy;