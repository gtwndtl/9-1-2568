
import ExoticDestinations from "../../assets/for_home_page/ExoticDestinations.webp";
import LuxuryCabins from "../../assets/for_home_page/LuxuryCabins.jpg";
import FineDining from "../../assets/for_home_page/FineDining.webp";
import v1 from "../../assets/cruise_video/v1.mp4";
import v2 from "../../assets/cruise_video/v2.mp4";
import v3 from "../../assets/cruise_video/v3.mp4";
import v4 from "../../assets/cruise_video/v4.mp4";
import "./home.css";
import { useEffect } from "react";
import PromotionPopUp from "../../promotion/pages/promotionpopup/PromotionPopUp";

const Home = () => {
    useEffect(() => {
        const videoPlayer = document.getElementById('video-player') as HTMLVideoElement | null; // ตรวจสอบว่าเป็น HTMLVideoElement

        if (!videoPlayer) {
            console.error("Video player not found.");
            return; // ออกจากฟังก์ชันถ้าไม่มี videoPlayer
        }

        const videoSources = [v1, v2, v3, v4]; // รายชื่อวิดีโอ
        let currentVideoIndex = 0;

        const playNextVideo = () => {
            currentVideoIndex = (currentVideoIndex + 1) % videoSources.length; // หมุนวนไปยังวิดีโอถัดไป
            videoPlayer.src = videoSources[currentVideoIndex];
            videoPlayer.play().catch((error) => console.error("Error playing video:", error)); // จัดการข้อผิดพลาด
        };

        // ตั้งค่า source เริ่มต้นและเล่นวิดีโอ
        videoPlayer.src = videoSources[currentVideoIndex];
        videoPlayer.play().catch((error) => console.error("Error playing video:", error));

        // เพิ่ม event listener
        videoPlayer.addEventListener('ended', playNextVideo);

        // ลบ event listener เมื่อ component ถูกทำลาย
        return () => {
            videoPlayer.removeEventListener('ended', playNextVideo);
        };
    }, []);


    return (
        <div className="home">
            <div className="promotion-pop-up"><PromotionPopUp /></div>
            <div className='home-header'>
                <div className="overlay"></div>
                <video id="video-player" autoPlay muted></video>
                <div className="home-header-content">
                    <h2>Life is a journey, make it a memorable one</h2>
                    <p className="home-quote">"Travel far, live fully, and dream endlessly."</p>
                    <button className="btn-booking">
                        <span className="icon-booking">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="24" fill="currentColor" className="bi bi-airplane-fill" viewBox="0 0 16 16">
                                <path d="M6.428 1.151C6.708.591 7.213 0 8 0s1.292.592 1.572 1.151C9.861 1.73 10 2.431 10 3v3.691l5.17 2.585a1.5 1.5 0 0 1 .83 1.342V12a.5.5 0 0 1-.582.493l-5.507-.918-.375 2.253 1.318 1.318A.5.5 0 0 1 10.5 16h-5a.5.5 0 0 1-.354-.854l1.319-1.318-.376-2.253-5.507.918A.5.5 0 0 1 0 12v-1.382a1.5 1.5 0 0 1 .83-1.342L6 6.691V3c0-.568.14-1.271.428-1.849Z"></path>
                            </svg>
                        </span>
                        <span className="text-booking">Book Now</span>
                    </button>
                </div>
            </div>
            <section className="why-highlights">
                <div>
                    <h1
                        style={{
                            fontSize: "48px",
                            fontWeight: "700",
                            color: "#000",
                            marginBottom: "24px",
                            lineHeight: "1.2",
                            fontFamily: "'San Francisco', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
                            textAlign: "center",
                        }}
                    >
                        Why Choose Us?
                    </h1>
                </div>
                <div className="why-card-view">
                    <div className="why-card-container">
                        <div className="why-card">
                            <div className="why-img-content">
                                <img
                                    src={LuxuryCabins}
                                    alt="Luxury Cabins"
                                />
                                <div className="overlay">
                                    <h2>Luxury Cabins</h2>
                                </div>
                            </div>
                            <div className="why-content">
                                <p className="why-heading">Luxury Cabins</p>
                                <p>
                                    Relax in spacious, well-designed cabins offering scenic views and ultimate comfort.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="why-card-container">
                        <div className="why-card">
                            <div className="why-img-content">
                                <img
                                    src={ExoticDestinations}
                                    alt="Exotic Destinations"
                                />
                                <div className="overlay">
                                    <h2>Exotic Destinations</h2>
                                </div>
                            </div>
                            <div className="why-content">
                                <p className="why-heading">Exotic Destinations</p>
                                <p>
                                    Embark on journeys to breathtaking destinations around the globe, creating unforgettable memories.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="why-card-container">
                        <div className="why-card">
                            <div className="why-img-content">
                                <img
                                    src={FineDining}
                                    alt="Fine Dining"
                                />
                                <div className="overlay">
                                    <h2>Fine Dining</h2>
                                </div>
                            </div>
                            <div className="why-content">
                                <p className="why-heading">Fine Dining</p>
                                <p>
                                    Savor gourmet cuisines crafted by world-renowned chefs, offering flavors from every corner of the world.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
