import { Builder } from "@builder.io/react";
import { Services } from "./components/Services";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

Builder.registerComponent(Services, {
    name: "Services",
    friendlyName: "Services Section",
});

Builder.registerComponent(Navbar, {
    name: "Navbar",
});

Builder.registerComponent(Footer, {
    name: "Footer",
});

import { PortfolioHero } from "./components/portfolio/PortfolioHero";
import { PortfolioProjects } from "./components/portfolio/PortfolioProjects";

Builder.registerComponent(PortfolioHero, {
    name: "PortfolioHero",
    inputs: [
        { name: "title", type: "string", defaultValue: "Our Work" },
        { name: "subtitle", type: "string", defaultValue: "A showcase of digital experiences..." },
    ],
});

Builder.registerComponent(PortfolioProjects, {
    name: "PortfolioProjects",
});

import { Hero } from "./components/Hero";
import { ServiceMarquee } from "./components/ServiceMarquee";
import { Ongoing } from "./components/Ongoing";
import { About } from "./components/About";
import { Contact } from "./components/Contact";

Builder.registerComponent(Hero, {
    name: "Hero",
    inputs: [
        { name: "title1", type: "string", defaultValue: "SHINE" },
        { name: "title2", type: "string", defaultValue: "BRIGHT" },
        { name: "subtitle", type: "string", defaultValue: "We blend creativity and technology to boost your digital presence." },
        { name: "buttonText", type: "string", defaultValue: "Start Project" },
    ],
});
Builder.registerComponent(ServiceMarquee, { name: "ServiceMarquee" });
Builder.registerComponent(Ongoing, { name: "Ongoing" });
Builder.registerComponent(About, { name: "About" });
Builder.registerComponent(Contact, { name: "Contact" });
