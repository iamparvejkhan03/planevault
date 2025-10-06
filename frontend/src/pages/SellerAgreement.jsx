import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const SellerAgreement = () => {
    return (
        <section className="pt-32 pb-10 text-gray-800">
            <Container>
                <h1 className="text-4xl md:text-5xl font-bold my-5 text-black">Seller Agreement</h1>

                <p className="mb-2">Effective Date: October 6, 2025</p>
                <p className="mb-4">Last Updated: October 6, 2025</p>
                <p className="mb-4">
                    This Seller Agreement outlines the responsibilities of sellers listing items on Plane Vault.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">1. Eligibility</h2>
                <ul className="mb-4">
                    <li>- Must be 18+ and legally capable of selling the item.</li>
                    <li>- Must have full ownership and right to sell, free of undisclosed liens.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">2. Listing Requirements</h2>
                <ul className="mb-4">
                    <li>- Provide accurate and complete details (make, model, year, serial, registration, FAA documents, logbooks, known issues).</li>
                    <li>- Upload clear, representative photos.</li>
                    <li>- Disclose non-airworthy status if applicable.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">3. Listing Terms</h2>
                <ul className="mb-4">
                    <li>- Sellers may set reserve prices.</li>
                    <li>- Once reserve is met, final bid is binding.</li>
                    <li>- Sellers may not cancel active listings without Plane Vault approval.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">4. Fees</h2>
                <ul className="mb-4">
                    <li>- Listing fees and commissions are non-refundable.</li>
                    <li>- Optional upgrades are available.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">5. Obligations Upon Sale</h2>
                <ul className="mb-4">
                    <li>- Seller must complete transfer and provide FAA Bill of Sale (Form 8050-2), registration, and logbooks.</li>
                    <li>- Must cooperate with buyer to arrange pickup or delivery.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">6. Prohibited Conduct</h2>
                <ul className="mb-4">
                    <li>- No shill bidding or artificial bid inflation.</li>
                    <li>- No off-platform transactions to avoid fees.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">7. Liability & Indemnification</h2>
                <ul className="mb-4">
                    <li>- Sellers warrant accuracy of all listing information.</li>
                    <li>- All items are sold “as is, where is.”</li>
                    <li>- Seller indemnifies Plane Vault against claims arising from misrepresentation or disputes.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">8. Termination</h2>
                <p className="mb-4">
                    Plane Vault reserves the right to suspend or terminate seller accounts.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">9. Amendments</h2>
                <p className="mb-4">
                    This Agreement may be updated periodically; continued use constitutes acceptance.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">10. Governing Law</h2>
                <p className="mb-4">
                    This Agreement is governed by Florida law.
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

export default SellerAgreement;