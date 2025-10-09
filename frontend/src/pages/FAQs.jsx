import { Container, FAQs } from "../components";

const faqs = [
    {
        question: "Who can list items for sale on Plane Vault?",
        answer: "Sellers must be at least 18 years old, legally capable of selling the item, and have full ownership or authorization to sell.",
    },
    {
        question: "What information do I need to provide in my listing?",
        answer: "You must provide accurate details such as make, model, year, serial number, registration, FAA documents, logbooks, and clear photos. If the item is not airworthy, you must disclose this.",
    },
    {
        question: "Can I set a reserve price on my listing?",
        answer: "Yes, you may set a reserve price. Once the reserve is met, the highest bid becomes binding and the seller is obligated to complete the sale.",
    },
    {
        question: "Are there any fees for selling?",
        answer: "No, listing fees and commissions do not apply currently, so the platform is free for sellers to list. Optional upgrades, such as featured placement, will also be available soon.",
    },
    {
        question: "Are there any fees for buying?",
        answer: "Yes, 5% will get charged to the card on file at the close of the auction to the winning bidder, with a maximum commission of $10,000 for all sales under $500,000 and 3% for all sales over $500,000.",
    },
    {
        question: "What happens after my item sells?",
        answer: "You are required to complete the transfer of ownership, provide necessary FAA documentation such as the Bill of Sale and registration, and coordinate pickup or delivery with the buyer.",
    },
    {
        question: "Can I cancel my listing?",
        answer: "Active listings cannot be canceled without Plane Vault approval. Canceling without valid reason may impact your account standing.",
    },
    {
        question: "Am I allowed to negotiate or complete a sale outside the platform?",
        answer: "No, off-platform transactions to avoid fees are prohibited. All transactions must be completed through Plane Vault to ensure protection for both buyers and sellers.",
    },
];

function FAQsPage() {
    return (
        <section className="pt-24 md:pt-32 pb-16 max-w-full text-gray-600">
            <Container>
                <h2 className="text-4xl md:text-5xl font-bold my-5 text-primary">FAQs</h2>
                <p className="text-primary mt-4 mb-10">Your trust is the most valuable asset we handle. To ensure a seamless and transparent experience, we've compiled answers to the most common questions.</p>
            </Container>

            <Container>
                <FAQs faqs={faqs} />
            </Container>
        </section >
    );
}

export default FAQsPage;