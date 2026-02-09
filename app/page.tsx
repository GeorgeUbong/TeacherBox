import react from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WifiOff, Lock, Lightbulb, Icon } from 'lucide-react';
import NavBar from './components/NavBar';
import pic from '../app/assets/childs.png';
import Sidebar from './components/SideBar';

export default function Home() {
  const features = [
    {
      icon: WifiOff, // Use the imported Lucide React component
      title: "Offline first",
      subtext: "Access all content without internet. Perfect for remote areas.",
      id: 1,
    },
    {
      icon: Lightbulb, // The Lightbulb icon works well for 'Learning'
      title: "Affordable Learning",
      subtext: "Locally served content, one time payment no more fees.",
      id: 2,
    },
    {
      icon: Lock, // The standard Lock icon for security
      title: "Private and Secure",
      subtext: "Your data stays on your device. No external servers.",
      id: 3,
    },
  ];



  return (
    <>
      <NavBar />
      <main className='bg-white min-h-screen text-black'>
        <section className="px-6 md:px-12 py-16 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-bold mb-8 text-[#267CD1]">Welcome To BridgeBox</h1>
          <p className="text-gray-700 mb-8 text-xl">Designed for environments where internet is unreliable or unavailable. Deploy on a Raspberry Pi and serve education to your community.</p>

          <Link href="/dashboard">
            <button className="bg-blue-500 text-white font-semibold px-8 py-3 rounded-full hover:bg-white hover:text-[#267CD1] border border-[#267CD1] transition mb-12">
              Get Started
            </button>
          </Link>

          <Image
            src={pic}
            width={400}
            height={300}
            alt='children class'
            className="rounded-lg w-full max-w-2xl mx-auto"
          />
        </section>

        <section className="px-6 md:px-12 py-16 text-center max-w-5xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-[#267CD1]">Why Bridge-Box?</h3>
          <p className="text-gray-700 mb-12 text-lg md:text-xl">Designed for environments where internet is unreliable or unavailable. Deploy on a Raspberry Pi and serve education to your community.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div key={feature.id} className="bg-blue-50 rounded-lg p-8 text-center shadow-sm hover:shadow-md transition">
                  <IconComponent className="w-14 h-14 text-blue-500 mx-auto mb-4" />
                  <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.subtext}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-6 md:px-12 py-16">
          <div className="bg-blue-500 rounded-3xl p-8 md:p-16 text-white text-center max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Upload learning materials?</h2>
            <p className="mb-8 text-blue-100 text-lg">Add lesson notes, PDFs, and videos for your students to access anytime.</p>
            <Link href="/dashboard">
              <button className="bg-white text-blue-500 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition">
                Manage Lessons
              </button>
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}