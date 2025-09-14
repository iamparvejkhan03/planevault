import { Link } from "react-router";
import { Container } from "../components";
import { otherData } from "../assets";

const BuyerAgreement = () => {
    return (
        <section className="pt-32 pb-10 text-gray-800">
            <Container>
                <h1 className="text-4xl md:text-5xl font-bold my-5 text-black">Buyer Agreement</h1>

                <p className="mb-2">Effective Date: September 14, 2025</p>
                <p className="mb-4">Last Updated: September 14, 2025</p>
                <p className="mb-4">
                    This Buyer Agreement governs buyer participation in listings.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">1. Eligibility</h2>
                <ul className="mb-4">
                    <li>- Must be 18+ and legally able to enter contracts.</li>
                    <li>- Provide valid payment information.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">2. Bidding Rules</h2>
                <ul className="mb-4">
                    <li>- All bids are binding commitments to purchase.</li>
                    <li>- Winning bidders are legally obligated to complete the transaction.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">3. Due Diligence</h2>
                <ul className="mb-4">
                    <li>- Buyers must conduct inspections and review documentation before bidding.</li>
                    <li>- Plane Vault does not verify listings.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">4. Payments & Fees</h2>
                <ul className="mb-4">
                    <li>- Winning bid + buyer’s premium + applicable taxes are payable.</li>
                    <li>- Deposits may be required; forfeited if buyer fails to perform.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">5. Ownership Transfer</h2>
                <ul className="mb-4">
                    <li>- Seller must provide FAA Bill of Sale and required documentation.</li>
                    <li>- Buyer must complete FAA registration transfer (Form 8050-1).</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">6. Prohibited Conduct</h2>
                <ul className="mb-4">
                    <li>- No false bids, bid manipulation, or fraudulent activity.</li>
                    <li>- No attempts to bypass Plane Vault fees.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">7. Risk & Liability</h2>
                <ul className="mb-4">
                    <li>- All sales are “as is, where is.”</li>
                    <li>- Plane Vault assumes no responsibility for condition, airworthiness, or title.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">8. Disputes</h2>
                <p className="mb-4">
                    Buyer and seller are solely responsible for resolving disputes.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">9. Limitation of Liability</h2>
                <p className="mb-4">
                    Plane Vault is not liable for any damages or losses. Buyer releases Plane Vault from all claims related to purchases.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">10. Amendments</h2>
                <p className="mb-4">
                    This Agreement may be updated periodically. Continued use constitutes acceptance.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">11. Governing Law</h2>
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

export default BuyerAgreement;