'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Wine, Utensils, ChefHat, Sparkles, Star, Quote } from 'lucide-react';
import Image from 'next/image';
import StickyBookButton from '@/components/StickyBookButton';
import ExclusivityBanner from '@/components/ExclusivityBanner';

const OPENTABLE_URL = 'https://www.opentable.com/booking/restref/availability?lang=en-US&correlationId=81924113-fdaa-4f58-b0e9-a7706eb8fb2d&restRef=1389850&otSource=Restaurant%20website';

export default function Home() {
    return (
        <main className="min-h-screen bg-matte-black text-white overflow-x-hidden relative">
            <div className="checkered-pattern fixed inset-0 pointer-events-none" />
            <ExclusivityBanner />
            <StickyBookButton />

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
                <div className="absolute inset-0 bg-matte-black" />

                {/* Hero Background Image */}
                <div className="absolute inset-0 opacity-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/images/IMG_1294 (1).jpg"
                        alt="Rebellion Italian Dining"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-matte-black via-matte-black/40 to-black/60" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="mb-6 flex justify-center">
                            <span className="bg-rebellion-red/90 text-white px-4 py-1 rounded-full text-sm font-serif tracking-widest uppercase">
                                February Exclusive
                            </span>
                        </div>
                        <h1 className="font-display text-6xl md:text-8xl font-bold mb-6 text-white drop-shadow-2xl">
                            A Rebel's <span className="text-rebellion-red">Romance</span>
                        </h1>
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="font-serif text-2xl md:text-4xl text-saffron-gold mb-8 italic"
                        >
                            The Italian Takeover
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="font-serif text-lg md:text-xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed drop-shadow-lg"
                        >
                            Experience the passion of handmade pasta and the drama of Italian romance.
                            Available only for the month of February.
                        </motion.p>
                        <motion.a
                            href={OPENTABLE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.5, duration: 0.5 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block bg-rebellion-red hover:bg-rebellion-red/90 text-white px-12 py-5 rounded-full font-display text-xl shadow-2xl transition-all duration-300 border border-white/20"
                        >
                            Book Your Table
                        </motion.a>
                    </motion.div>
                </div>
            </section>

            {/* Introduction / Hook */}
            <section className="py-24 px-6 bg-charcoal text-center">
                <div className="max-w-4xl mx-auto">
                    <Quote className="w-12 h-12 text-saffron-gold mx-auto mb-6 opacity-50" />
                    <h2 className="font-display text-3xl md:text-5xl text-white mb-8 leading-tight">
                        "We're rebelling against the ordinary Italian dinner. This is distinct, bold, and unapologetically romantic."
                    </h2>
                    <div className="w-24 h-1 bg-rebellion-red mx-auto" />
                </div>
            </section>

            {/* Video Section */}
            <section className="py-24 px-6 bg-matte-black">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12"
                    >
                        <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">
                            Experience the <span className="text-rebellion-red">Rebellion</span>
                        </h2>
                        <p className="font-serif text-xl text-saffron-gold italic">See what awaits you</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex justify-center"
                    >
                        <div className="w-full max-w-sm aspect-[9/16] rounded-xl overflow-hidden border-2 border-rebellion-red/30 shadow-2xl shadow-rebellion-red/10">
                            <iframe
                                src="https://www.youtube.com/embed/MmdJZI6GvTg?feature=share"
                                title="Rebellion Beachside Bar & Bistro Experience"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Fresh Handmade Pasta - THE HEART */}
            <section className="relative py-24 px-6 bg-matte-black">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative h-[600px] rounded-lg overflow-hidden hidden md:block"
                        >
                            <Image
                                src="/images/imgi_8_625983422_17916357039270601_5876881641824152807_n.jpg"
                                alt="Handmade Pasta Daily"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-8 left-8">
                                <p className="text-saffron-gold font-display text-3xl">Handmade Daily</p>
                            </div>
                        </motion.div>

                        <div>
                            <div className="mb-12">
                                <Sparkles className="w-10 h-10 text-saffron-gold mb-4" />
                                <h2 className="font-display text-5xl md:text-6xl font-bold mb-4">
                                    The Heart of the <span className="text-rebellion-red">Rebellion</span>
                                </h2>
                                <p className="font-serif text-gray-300 text-lg">
                                    Every strand crafted by hand, just like your nonna made it—but with a rebellious edge.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <PastaCard
                                    title="Bolognese"
                                    description="Fresh pappardelle paired with pecorino sardo"
                                    price="$18 / $35"
                                    delay={0.1}
                                />
                                <PastaCard
                                    title="Three Cheese Ravioli"
                                    description="Pillows of fresh pasta served in a luxurious black truffle fonduta"
                                    price="$17 / $32"
                                    delay={0.2}
                                />
                                <PastaCard
                                    title="Seafood Scampi"
                                    description="Linguine fini featuring local shrimp in a rich lemon butter sauce"
                                    price="$22 / $39"
                                    delay={0.3}
                                />
                                <PastaCard
                                    title="Spaghetti and Meatballs"
                                    description="A classic preparation, just like your nonna made it"
                                    price="$27"
                                    delay={0.4}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Parallax Break - Steak */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-fixed bg-center bg-cover" style={{ backgroundImage: "url('/images/IMG_1286.jpg')" }}>
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center max-w-4xl px-6">
                    <h2 className="font-display text-5xl md:text-7xl text-white mb-6 drop-shadow-2xl">
                        The Showstoppers
                    </h2>
                    <p className="font-serif text-2xl text-saffron-gold italic drop-shadow-md">
                        Dishes designed to leave you speechless
                    </p>
                </div>
            </section>

            {/* The Showstoppers Menu */}
            <section className="relative py-24 px-6 bg-charcoal">
                <div className="max-w-6xl mx-auto">
                    {/* Featured Item */}
                    <div className="bg-matte-black border border-rebellion-red/30 rounded-xl p-8 mb-16 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rebellion-red/10 rounded-full blur-3xl" />
                        <span className="text-rebellion-red font-display text-sm tracking-widest uppercase mb-2 block">The Centerpiece</span>
                        <h3 className="font-display text-4xl md:text-5xl text-white mb-4">Bistecca Fiorentina</h3>
                        <p className="font-serif text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                            A massive T-bone steak served with roasted garlic and rustic potatoes. The ultimate sharing experience.
                        </p>
                        <span className="text-saffron-gold font-display text-4xl">$117</span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ShowstopperCard
                            title="Whole Branzino"
                            description="Prepared with lemon caper sauce, fingerling potatoes, and chicory"
                            price="$60"
                            delay={0.1}
                        />
                        <ShowstopperCard
                            title="Eggplant Amatriciana"
                            description="Fried eggplant with amatriciana sauce and parmesan foam"
                            price="$34"
                            delay={0.2}
                        />
                        <ShowstopperCard
                            title="Roast Chicken"
                            description="Served with broccoli rabe, golden raisins, and chicken sugo"
                            price="$37"
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* Parallax Break - Small Bites */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src="/images/IMG_1252.jpg"
                        alt="Italian Small Bites"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-10 text-center">
                    <h2 className="font-display text-5xl md:text-6xl text-white drop-shadow-xl">
                        Small Bites, Big Flavor
                    </h2>
                </div>
            </section>

            {/* Assaggini */}
            <section className="relative py-24 px-6 bg-matte-black">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-display text-5xl md:text-6xl font-bold mb-4">
                            Assaggini
                        </h2>
                        <p className="font-serif text-xl text-saffron-gold italic">The Opening Act</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
                        <SmallBiteCard
                            title="Arancini"
                            description="Fried saffron risotto stuffed with fontina and served with saffron aioli"
                            price="$11"
                            delay={0.1}
                        />
                        <SmallBiteCard
                            title="Salumi Board"
                            description="Three varieties of artisanal cured sausages"
                            price="$18"
                            delay={0.2}
                        />
                        <SmallBiteCard
                            title="Caprese"
                            description="Prosciutto and burrata with basil pesto and blistered cherry tomatoes"
                            price="$18"
                            delay={0.3}
                        />
                        <SmallBiteCard
                            title="Rock Shrimp Polpette"
                            description="Shrimp meatballs served with tomato sauce and peppadew peppers"
                            price="$16"
                            delay={0.4}
                        />
                        <SmallBiteCard
                            title="Caesar Salad"
                            description="Classic preparation with white anchovies and parmigiano reggiano"
                            price="$15"
                            delay={0.5}
                        />
                    </div>
                </div>
            </section>

            {/* Social Proof / Reviews */}
            <section className="py-24 px-6 bg-charcoal border-y border-white/5">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="flex justify-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-6 h-6 text-saffron-gold fill-current" />
                            ))}
                        </div>
                        <h2 className="font-display text-4xl text-white mb-2">The Word on the Street</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <ReviewCard
                            name="Michelle R."
                            review="The Bistecca Fiorentina was an absolute showstopper. I've never had a steak prepared this perfectly outside of Florence."
                            delay={0.1}
                        />
                        <ReviewCard
                            name="David K."
                            review="That Bolognese... I could eat it every day. The atmosphere perfectly balances upscale dining with a fun, rebellious vibe."
                            delay={0.2}
                        />
                        <ReviewCard
                            name="Sarah J."
                            review="Came for the cocktails, stayed for the pasta. The Tiramisu Martini is dangerous in the best way possible."
                            delay={0.3}
                        />
                    </div>
                </div>
            </section>

            {/* Liquid Rebellion */}
            <section className="relative py-24 px-6 bg-matte-black">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-display text-5xl md:text-6xl font-bold mb-4">
                            Liquid <span className="text-rebellion-red">Rebellion</span>
                        </h2>
                        <p className="font-serif text-xl text-saffron-gold italic">
                            Cocktails & Wine
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                        <CocktailCard
                            title="Tiramisu Martini"
                            description="Luksusowa potato vodka, giffard vanilla, and borghetti espresso liqueur"
                            price="$18"
                            delay={0.1}
                        />
                        <CocktailCard
                            title="Grappa Sour"
                            description="White grape infused grappa with chamomile liqueur and sassafras bitters"
                            price="$17"
                            delay={0.2}
                        />
                        <CocktailCard
                            title="Aperol Spritz"
                            description="Aperol, mahina coco, and strawberry topped with bubbles"
                            price="$16"
                            delay={0.3}
                        />
                        <div className="bg-gradient-to-br from-charcoal to-matte-black border border-saffron-gold/40 rounded-lg p-6 text-center flex flex-col justify-center shadow-lg">
                            <Wine className="w-10 h-10 text-saffron-gold mx-auto mb-4" />
                            <h3 className="font-display text-xl mb-2 text-saffron-gold">Featured Wine</h3>
                            <p className="font-display text-2xl mb-2 text-white">Brunello di Montalcino</p>
                            <span className="text-saffron-gold font-display text-2xl">$148</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer CTA */}
            <section className="relative py-32 px-6 bg-rebellion-red">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="font-display text-5xl md:text-7xl font-bold mb-8">
                        Join the Rebellion
                    </h2>
                    <p className="font-serif text-xl md:text-2xl mb-12 max-w-2xl mx-auto">
                        Tables are filling fast for this exclusive February engagement.
                    </p>
                    <motion.a
                        href={OPENTABLE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-block bg-white text-rebellion-red px-12 py-5 rounded-full font-display text-xl font-bold shadow-2xl hover:bg-gray-100 transition-all duration-300"
                    >
                        Reserve Now
                    </motion.a>
                    <p className="mt-8 text-white/80 font-serif">
                        Rebellion Beachside Bar & Bistro
                    </p>
                </div>
            </section>
        </main>
    );
}

// SIMPLIFIED Components for better conversion

function PastaCard({ title, description, price, delay }: { title: string; description: string; price: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="flex justify-between items-start border-b border-white/10 pb-6 group hover:border-saffron-gold/50 transition-colors duration-300"
        >
            <div>
                <h3 className="font-display text-2xl text-white mb-2 group-hover:text-saffron-gold transition-colors">
                    {title}
                </h3>
                <p className="font-serif text-gray-400 text-sm md:text-base leading-relaxed max-w-sm">
                    {description}
                </p>
            </div>
            <span className="text-saffron-gold font-display text-xl md:text-2xl ml-4 whitespace-nowrap">{price}</span>
        </motion.div>
    );
}

function ShowstopperCard({ title, description, price, delay }: { title: string; description: string; price: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            className="bg-matte-black border border-white/10 hover:border-rebellion-red p-8 rounded-lg text-center transition-all duration-300"
        >
            <h3 className="font-display text-2xl text-white mb-3 group-hover:text-rebellion-red transition-colors">
                {title}
            </h3>
            <p className="font-serif text-gray-400 mb-6 text-sm">
                {description}
            </p>
            <span className="text-saffron-gold font-display text-3xl">{price}</span>
            <div className="mt-6 w-full h-[1px] bg-gradient-to-r from-transparent via-rebellion-red/50 to-transparent" />
        </motion.div>
    );
}

function SmallBiteCard({ title, description, price, delay }: { title: string; description: string; price: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="text-center"
        >
            <h3 className="font-display text-xl text-white mb-2 font-bold">
                {title}
            </h3>
            <div className="w-12 h-[1px] bg-saffron-gold mx-auto mb-3" />
            <p className="font-serif text-gray-400 mb-3 text-sm">
                {description}
            </p>
            <span className="text-saffron-gold font-display text-lg">{price}</span>
        </motion.div>
    );
}

function CocktailCard({ title, description, price, delay }: { title: string; description: string; price: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="bg-charcoal/50 border border-white/5 p-6 rounded-lg text-center hover:bg-charcoal transition-colors duration-300"
        >
            <Wine className="w-8 h-8 text-rebellion-red mx-auto mb-3 opacity-80" />
            <h3 className="font-display text-xl text-white mb-2">{title}</h3>
            <p className="font-serif text-gray-400 mb-3 text-sm">
                {description}
            </p>
            <span className="text-saffron-gold font-display text-xl">{price}</span>
        </motion.div>
    );
}

function ReviewCard({ name, review, delay }: { name: string; review: string; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            className="bg-matte-black p-8 rounded-xl border border-white/5 relative"
        >
            <Quote className="w-8 h-8 text-rebellion-red mb-4 opacity-50 absolute top-6 left-6" />
            <p className="font-serif text-gray-300 italic mb-6 relative z-10 pt-4 leading-relaxed">
                "{review}"
            </p>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-saffron-gold/20 flex items-center justify-center text-saffron-gold font-display font-bold">
                    {name.charAt(0)}
                </div>
                <span className="font-display text-white">{name}</span>
            </div>
        </motion.div>
    )
}
