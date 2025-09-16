function HowItWorksCard({index, title, description, icon}) {
    return (
        <div className="rounded-lg relative group hover:shadow-xl transition-all duration-300 border border-gray-200 shadow-lg shadow-gray-100 bg-white text-card-foreground h-full">
            <p className="bg-gray-100 group-hover:bg-primary text-primary group-hover:text-white py-2 px-4 rounded-full absolute top-0 left-1/2 -translate-y-1/2 - -translate-x-1/2 transition-colors duration-300">{index + 1}</p>
            <div className="p-4 xl:p-5 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:bg-primary transition-colors duration-300 mt-4 text-primary group-hover:text-white">
                    {icon}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 leading-relaxed">
                    {description}
                </p>

            </div>
        </div>
    );
}

export default HowItWorksCard;