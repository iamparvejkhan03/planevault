function Description({description}) {
    return (
        <div className="">
            {/* <h3 className="my-5 text-primary text-xl font-semibold">Description</h3> */}
            <div className="prose max-w-none bg-gray-50 rounded-lg">
                {description ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                ) : (
                    <p className="text-gray-500">No description provided.</p>
                )}
            </div>
        </div>
    );
}

export default Description;