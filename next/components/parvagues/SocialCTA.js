import { FaInstagram, FaGitlab } from 'react-icons/fa';

export default function SocialCTA() {
    return (
        <div className="flex flex-wrap justify-center gap-6 py-12">
            <a
                href="https://instagram.com/parvagues.mp3"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gradient-to-br from-purple-600 to-pink-600 px-8 py-4 rounded-full text-white font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
            >
                <FaInstagram className="text-2xl" />
                <span>Instagram</span>
            </a>

            <a
                href="http://nech.pl/Tidal"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-black hover:bg-gray-900 px-8 py-4 rounded-full text-white font-bold text-lg transition-all transform hover:scale-105 shadow-lg border border-white/30 hover:border-white"
            >
                <FaGitlab className="text-2xl" />
                <span>GitLab</span>
            </a>
        </div>
    );
}
