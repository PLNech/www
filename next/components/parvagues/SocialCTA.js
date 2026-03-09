import { FaInstagram, FaTwitter, FaGithub } from 'react-icons/fa';
import { SiBluesky, SiMastodon } from 'react-icons/si';

export default function SocialCTA() {
    return (
        <div className="flex flex-wrap justify-center gap-6 py-12">
            <a
                href="https://instagram.com/parvagues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gradient-to-br from-purple-600 to-pink-600 px-8 py-4 rounded-full text-white font-bold text-lg hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
            >
                <FaInstagram className="text-2xl" />
                <span>Instagram</span>
            </a>

            <a
                href="https://bsky.app/profile/nech.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 px-8 py-4 rounded-full text-white font-bold text-lg transition-all transform hover:scale-105 shadow-lg border border-white/10 hover:border-white/30"
            >
                <SiBluesky className="text-2xl" />
                <span>Bluesky</span>
            </a>

            <a
                href="https://github.com/parvagues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-black hover:bg-gray-900 px-8 py-4 rounded-full text-white font-bold text-lg transition-all transform hover:scale-105 shadow-lg border border-white/30 hover:border-white"
            >
                <FaGithub className="text-2xl" />
                <span>GitHub</span>
            </a>
        </div>
    );
}
