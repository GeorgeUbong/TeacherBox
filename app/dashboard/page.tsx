import react from 'react';
import Sidebar from '../components/SideBar';
import LessonUp from './dashcomponents/Uploads';
import Users from './dashcomponents/users';
import RecentUploads from './dashcomponents/RecentUploads';

export default function Dash() {
    return (
        <div className="flex bg-white min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-0 sm:ml-64 bg-white text-black">
                <div className="p-6 md:p-12">
                    <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                    <p className="text-gray-600 mb-8">Welcome to your dashboard</p>

                    <section className="space-y-8">
                        {/* Lessons Uploaded Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1">
                                <LessonUp />
                            </div>

                            {/* Metrics Grid */}
                            <div className="lg:col-span-2">
                                <Users />
                            </div>
                        </div>
                    </section>

                    {/* Recent uploads table (placeholder) */}
                    <section className="mt-8">
                        <RecentUploads />
                    </section>

                    <section>

                    </section>
                </div>
            </main>
        </div>
    )
}