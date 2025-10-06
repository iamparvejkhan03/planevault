import { Link } from "react-router-dom";
import { Container } from "../components";
import { otherData } from "../assets";

const PrivacyPolicy = () => {
    return (
        <section className="pt-32 pb-10 text-gray-800">
            <Container>
                <h1 className="text-4xl md:text-5xl font-bold my-5 text-black">Privacy Policy</h1>

                <p className="mb-2">Effective Date: October 6, 2025</p>
                <p className="mb-4">Last Updated: October 6, 2025</p>
                <p className="mb-4">
                    Plane Vault ("we," "our," "us") values your privacy. This Privacy Policy explains how we collect,
                    use, disclose, and safeguard your information when you use our website and services (the "Services").
                    By using Plane Vault, you consent to the practices described below.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">1. Information We Collect</h2>
                <ul className="mb-4">
                    <li>- Personal information you provide: name, email, phone, billing/shipping address, payment info (processed via secure third parties).</li>
                    <li>- Account registration details: username, password, security verification.</li>
                    <li>- Automatic data: IP address, browser type, device details, cookies, and usage metrics.</li>
                    <li>- Transaction data: bids, purchases, listings, and related communications.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">2. How We Use Information</h2>
                <ul className="mb-4">
                    <li>- Provide and operate the Services.</li>
                    <li>- Facilitate listings, payments, and account management.</li>
                    <li>- Verify identity and prevent fraud or misuse.</li>
                    <li>- Enforce compliance with our Terms of Use.</li>
                    <li>- Communicate updates, notifications, and promotions (with opt-out options).</li>
                    <li>- Improve site functionality and user experience.</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">3. Sharing of Information</h2>
                <ul className="mb-4">
                    <li>- With third-party service providers (payment processors, hosting, escrow services).</li>
                    <li>- With buyers/sellers to facilitate transactions.</li>
                    <li>- As required by law, regulation, or legal process.</li>
                    <li>- During business transfers (merger, acquisition, or sale).</li>
                </ul>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">4. Data Security</h2>
                <p className="mb-4">
                    We use commercially reasonable measures to secure your information. However, no system is completely
                    secure, and you acknowledge the risks inherent in transmitting data online.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">5. Retention</h2>
                <p className="mb-4">
                    We retain data as long as necessary for operations, legal, or compliance obligations.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">6. Cookies & Tracking</h2>
                <p className="mb-4">
                    We use cookies and similar technologies for authentication, performance, and analytics. You may disable
                    cookies in your browser but some features may not function.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">7. User Rights</h2>
                <p className="mb-4">
                    Depending on jurisdiction, you may have rights to access, correct, delete, or restrict processing of
                    your personal data. Contact us to exercise these rights.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">8. Children’s Privacy</h2>
                <p className="mb-4">
                    We do not knowingly collect information from individuals under 18. If discovered, such data will be
                    deleted.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">9. International Users</h2>
                <p className="mb-4">
                    By using Plane Vault outside the U.S., you consent to your information being processed in the U.S.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">10. Amendments</h2>
                <p className="mb-4">
                    We may revise this Privacy Policy at any time. Updates will be posted with a new “Last Updated” date.
                    Continued use constitutes acceptance.
                </p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">11. Governing Law</h2>
                <p className="mb-4">This Privacy Policy is governed by Florida law.</p>

                <h2 className="text-2xl text-black font-semibold mt-6 mb-4">12. Contact</h2>
                <p className="mb-4">
                    Plane Vault <br />
                    {otherData.address} <br />
                    <Link className="text-blue-600 underline" to={`mailto:${otherData.email}`}>{otherData.email}</Link> <br />
                    <Link className="text-blue-600 underline" to={`tel:${otherData.phone}`}>(347) 745-6985</Link> <br />
                </p>
            </Container>
        </section>
    );
};

export default PrivacyPolicy;
