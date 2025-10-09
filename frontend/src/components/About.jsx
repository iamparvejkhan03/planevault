import { ChartColumnIncreasing, Shield, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { about, whoWeAre } from "../assets";
import { useEffect, useRef, useState } from "react";

function About() {
    const ref = useRef();
    const [iconColor, setIconColor] = useState({first:false, second:false, third:false});

    const handleScroll = () => {
        if(!ref?.current) return;

        const top = ref?.current?.getBoundingClientRect().top;

        if(top < 300){
            setIconColor({...iconColor, first: true});
        }
        if(top < 200){
            setIconColor({...iconColor, first: true, second: true});
        }

        if(top < 100){
            setIconColor({...iconColor, first: true, second: true, third: true});
        }

        if(top > 300){
            setIconColor({...iconColor, first: false});
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
    }, [])

    return (
        <section ref={ref} className="grid grid-cols-1 lg:grid-cols-8 gap-5 items-center">
            <div className="col-span-3 bg-gray-100 py-10 sm:py-14 lg:py-20 rounded">
                <img loading="lazy" src={whoWeAre} alt="" className="translate-x-5 sm:translate-x-10 md:translate-x-14 lg:translate-x-1/4 h-96 w-full object-cover [box-shadow:5px_5px_20px_rgba(0,0,0,0.15),-5px_-5px_20px_rgba(0,0,0,0.15)] rounded" />
            </div>
            <div className="col-span-1"></div>

            <div className="col-span-4">
                <h5 className="font-semibold text-secondary">About Us</h5>
                <h2 className="text-2xl md:text-3xl font-semibold my-4 text-primary">Who We Are</h2>
                <p className="text-secondary">PlaneVault is a trusted aircraft auction platform where you can sell or bid on aircraft, parts, and memorabilia. We make every transaction simple and reliable with secure technology and dedicated support.</p>

                <div className="space-y-5 my-5">
                    <div className="flex items-start gap-4">
                        <div className={`${iconColor.first == true ? 'bg-primary' : 'bg-gray-100'} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`} >
                            <Shield className={`${iconColor.first ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-2">
                                Trusted Expertise
                            </h3>
                            <p className="text-gray-600">
                                Years of aviation marketplace experience ensure every listing and auction runs smoothly.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className={`${iconColor.second == true ? 'bg-primary' : 'bg-gray-100'} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`} >
                            <Store className={`${iconColor.second ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-2">
                                Seller & Buyer Focused
                            </h3>
                            <p className="text-gray-600">
                                Whether you’re listing an aircraft or placing a bid, our platform is designed to protect your interests.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className={`${iconColor.third == true ? 'bg-primary' : 'bg-gray-100'} w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0`} >
                            <ChartColumnIncreasing className={`${iconColor.third ? 'text-white' : 'text-primary'}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-primary mb-2">
                                Proven Outcomes
                            </h3>
                            <p className="text-gray-600">
                                From aircraft to parts and memorabilia, sellers close deals and buyers gain confidence with every transaction.
                            </p>
                        </div>
                    </div>
                </div>

                <Link to={'/about'} className="bg-primary py-2 px-5 text-white rounded cursor-pointer inline-block">Read More</Link>
            </div>
        </section>
    );
}

export default About;