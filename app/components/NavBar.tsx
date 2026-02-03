import react from 'react';
import Image from 'next/image';
import img from '../assets/logo.png'

export default function NavBar() {
    
return (
    <nav className='bg-white border p-4'>
        <Image 
        alt='logo'
        src={img}
        height={200}
        width={200}
        />
    </nav>
)
}