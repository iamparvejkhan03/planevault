import { CalendarDays, CheckSquare, Clock, Download, File, Fuel, Gauge, Gavel, Heart, LayoutGrid, MapPin, MessageCircle, PaintBucket, Plane, ShieldCheck, Tag, User, Weight } from "lucide-react";
import { Container, LoadingSpinner } from "../components";
import { Link } from "react-router-dom";
import { about, aboutUs, heroImg } from "../assets";
import { lazy, Suspense } from "react";

const YouTubeEmbed = lazy(() => import('../components/YouTubeEmbed'));
const CommentSection = lazy(() => import('../components/CommentSection'));

function SingleAuction() {
    return (
        <Container className={`py-32 min-h-[70vh] grid grid-cols-3 items-start gap-10`}>
            <section className="col-span-2">
                {/* Title and top section */}
                <div className="flex justify-between items-center text-secondary">
                    <Link to={`/`} className="underline">Category: Aircraft</Link>
                    <div className="flex items-center gap-3">
                        <p className="flex items-center gap-2 border border-gray-200 py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100">
                            <Heart size={20} />
                            <span>21</span>
                        </p>

                        <p className="flex items-center gap-2 border border-gray-200 py-1 px-3 rounded-full cursor-pointer hover:bg-gray-100">
                            <MessageCircle size={18} />
                            <span>13</span>
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-semibold my-6 text-primary">1970 Piper Cherokee 140</h2>

                {/* Image section */}
                <div className="flex flex-col gap-5">
                    <div className="relative">
                        <img src={heroImg} alt="auction image" className="block object-cover h-[450px] w-full rounded-xl" />
                        <p className="flex items-center gap-2 absolute bottom-5 right-5 bg-white py-3 px-5 rounded-md cursor-pointer">
                            <LayoutGrid strokeWidth={1.5} fill="#000" />
                            <span>See all photos (13)</span>
                        </p>
                    </div>
                    <div className="w-full grid grid-cols-3 gap-3">
                        <img src={about} alt="auction image" className="object-cover h-32 w-full rounded-lg" />
                        <img src={aboutUs} alt="auction image" className="object-cover h-32 w-full rounded-lg" />
                        <img src={heroImg} alt="auction image" className="object-cover h-32 w-full rounded-lg" />
                    </div>
                </div>

                <hr className="my-8" />

                {/* Info section */}
                <div>
                    <h3 className="my-5 text-primary text-xl font-semibold">Specifications</h3>
                    <div className="grid grid-cols-4 gap-x-5 gap-y-10">
                        <div className="flex items-center gap-3">
                            <Plane size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Make</p>
                                <p className="font-medium text-lg">Piper</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Tag size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Model</p>
                                <p className="font-medium text-lg">140</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CalendarDays size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Year</p>
                                <p className="font-medium text-lg">2009</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckSquare size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Registration</p>
                                <p className="font-medium text-lg">N77310</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Location</p>
                                <p className="font-medium text-lg">New York</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <User size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Seats</p>
                                <p className="font-medium text-lg">2</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Fuel size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Fuel</p>
                                <p className="font-medium text-lg">3611 LB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Total Hours</p>
                                <p className="font-medium text-lg">5725</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Gauge size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Engine Type</p>
                                <p className="font-medium text-lg">Turbo</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Weight size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Weight</p>
                                <p className="font-medium text-lg">12,500 LB</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <PaintBucket size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Color</p>
                                <p className="font-medium text-lg">Blue</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={40} strokeWidth={1}  />
                            <div>
                                <p className="text-secondary">Condition</p>
                                <p className="font-medium text-lg">Air Worthy</p>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-8" />

                {/* Document section */}
                <div>
                    <h3 className="my-5 text-primary text-xl font-semibold">Document(s)</h3>
                    <div className="flex gap-5 max-w-full flex-wrap">
                        <Link to={``} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 py-3 px-5 rounded-md text-secondary group hover:text-primary">
                            <File size={20} className="flex-shrink-0" />
                            <span className="group-hover:underline">aircraft.pdf</span>
                            <Download size={20} className="flex-shrink-0" />
                        </Link>
                        <Link to={``} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 py-3 px-5 rounded-md text-secondary group hover:text-primary">
                            <File size={20} className="flex-shrink-0" />
                            <span className="group-hover:underline">aircraft.pdf</span>
                            <Download size={20} className="flex-shrink-0" />
                        </Link>
                        <Link to={``} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 py-3 px-5 rounded-md text-secondary group hover:text-primary">
                            <File size={20} className="flex-shrink-0" />
                            <span className="group-hover:underline">aircraft.pdf</span>
                            <Download size={20} className="flex-shrink-0" />
                        </Link>
                        <Link to={``} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer border border-gray-200 py-3 px-5 rounded-md text-secondary group hover:text-primary">
                            <File size={20} className="flex-shrink-0" />
                            <span className="group-hover:underline">aircraft.pdf</span>
                            <Download size={20} className="flex-shrink-0" />
                        </Link>
                    </div>
                </div>

                <hr className="my-8" />

                {/* Video section */}
                <div>
                    <h3 className="my-5 text-primary text-xl font-semibold">Video Look</h3>
                    <Suspense fallback={<LoadingSpinner />}>
                        <YouTubeEmbed videoId={'https://youtu.be/cIeX0-_Gt50?si=qUHCO_rFh20jKHtA'} title="video" />
                    </Suspense>
                </div>

                <hr className="my-8" />

                {/* Comment section */}
                <Suspense fallback={<LoadingSpinner />}>
                    <CommentSection />
                </Suspense>

                <hr className="my-8" />

                {/* Description section */}
                <div>
                    <h3 className="my-5 text-primary text-xl font-semibold">Description</h3>
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati porro incidunt modi nihil quibusdam dolorum magnam. Voluptatibus sed totam necessitatibus, officiis ratione dolorum temporibus, accusantium blanditiis excepturi quis, facilis aliquid! Enim accusantium illo architecto sapiente nisi nostrum voluptate, modi eum sint, deserunt iste porro inventore deleniti est voluptatibus consequatur unde. Quibusdam debitis nulla esse culpa numquam cum inventore qui voluptates, explicabo laudantium enim voluptate a eius fugit reprehenderit dignissimos! Sequi, a. A sed veritatis laudantium sequi quod unde officia molestias necessitatibus aliquid impedit error dolore optio explicabo aspernatur, deserunt doloribus similique, culpa recusandae labore. Earum quae voluptate, odio doloremque facilis excepturi voluptates obcaecati quisquam, nobis nam in quam sint omnis eveniet voluptatum maxime laborum eius dolores similique tenetur accusantium! Labore possimus fuga aspernatur molestiae, sed error pariatur eveniet ducimus libero sit? Minus magni non doloribus voluptatem a eligendi, velit quas tempora qui ipsam dolore dolores maxime error repellat corporis incidunt perferendis in corrupti, pariatur rem sapiente minima doloremque id officia. Aliquid at aut accusamus nisi, dolores provident ea repellendus expedita ullam. Ipsam quasi aspernatur voluptatem officiis assumenda reprehenderit atque aliquam in sequi iure, at maxime voluptates? Cupiditate eligendi nemo facere alias in delectus vitae incidunt blanditiis aliquam sint eos est, neque id reprehenderit autem doloribus excepturi illo. Labore repellendus laborum exercitationem est quam provident sapiente, numquam necessitatibus sed itaque accusantium praesentium soluta ipsa modi aliquid perferendis voluptates quas nisi ea ratione nesciunt quaerat facere a libero? Velit, ab in doloribus culpa tempora, repellendus veniam laborum labore porro, fuga placeat harum.</p>
                </div>
            </section>

            <section className="col-span-1 border border-gray-200 bg-gray-100 rounded-lg">
                {/* Timer section */}
                <div className="py-5 px-6 rounded-lg grid grid-cols-4 text-2xl">
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200 px-2">
                        <span>00</span>
                        <span className="text-base font-light">Days</span>
                    </p>
                    {/* <span className="font-thin text-gray-200 text-6xl">|</span> */}
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200">
                        <span>10</span>
                        <span className="text-base font-light">Hours</span>
                    </p>
                    {/* <span className="font-thin text-gray-200 text-6xl">|</span> */}
                    <p className="flex flex-col items-center gap-2 border-r-2 border-gray-200">
                        <span>15</span>
                        <span className="text-base font-light">Minutes</span>
                    </p>
                    {/* <span className="font-thin text-gray-200 text-6xl">|</span> */}
                    <p className="flex flex-col items-center gap-2">
                        <span>57</span>
                        <span className="text-base font-light">Seconds</span>
                    </p>
                </div>

                <hr className="mx-6" />

                {/* Current bid section */}
                <div className="p-6 flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <p className="font-light">Current Bid</p>
                        <p className="flex items-center gap-2 text-4xl font-medium">
                            <span>$</span>
                            <span>80</span>
                        </p>
                    </div>

                    <p className="text-secondary">Reserve Not Met</p>

                    <p className="flex w-full justify-between border-b pb-2">
                        <span className="text-secondary">Starting Bid</span>
                        <span className="font-medium">$10</span>
                    </p>

                    <p className="flex w-full justify-between border-b pb-2">
                        <span className="text-secondary">No. of Bids</span>
                        <span className="font-medium">21</span>
                    </p>

                    <form className="flex flex-col gap-4">
                        <input type="number" className="py-3 px-5 w-full rounded-lg" placeholder="Bid $85 or up" min={85} />
                        <button className="flex items-center justify-center gap-2 w-full bg-primary text-white py-3 px-6 cursor-pointer rounded-lg">
                            <Gavel />
                            <span>Place Bid</span>
                        </button>
                    </form>

                    <p className="text-center bg-white p-1 text-secondary text-sm">21 other people are watching.</p>

                    <table>
                        <thead>
                            <tr className="text-left text-secondary text-sm">
                                <th className="font-normal">Bidder</th>
                                <th className="font-normal">Time</th>
                                <th className="font-normal">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="text-sm font-medium">
                                <td className="py-2">formyclient347</td>
                                <td className="py-2">23 h ago</td>
                                <td className="py-2">$ 80</td>
                            </tr>
                            <tr className="text-sm font-medium">
                                <td className="py-2">sahidbhai9491</td>
                                <td className="py-2">1 d ago</td>
                                <td className="py-2">$ 70</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </Container>
    );
}

export default SingleAuction;