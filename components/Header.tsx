import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import {NavItems} from "@/components/NavItems";
import UserDropdown from "@/components/UserDropdown";
const Header = () => {
    return (
        <header className=" sticky top-0 header">
            <div className=" container header-wrapper">
                <Link href = "/">
                    <Image src="/assets/images/logo.png" alt="Big-Bull" width={140} height={32} className="h-16 w-30 cursor-pointer" />
                </Link>
                <nav className="hidden sm:block">
                    <NavItems />
                </nav>
                <UserDropdown/>
            </div>
        </header>
    )
}
export default Header
