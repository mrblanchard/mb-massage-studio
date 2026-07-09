import { AboutEditForm } from "@/components/edit/forms/about-form";
import { ColumnsEditForm } from "@/components/edit/forms/columns-form";
import { TwoColumnEditForm } from "@/components/edit/forms/two-column-form";
import { BlogListEditForm } from "@/components/edit/forms/blog-list-form";
import { ContactEditForm } from "@/components/edit/forms/contact-form";
import { CtaEditForm } from "@/components/edit/forms/cta-form";
import { GalleryEditForm } from "@/components/edit/forms/gallery-form";
import { HeroEditForm } from "@/components/edit/forms/hero-form";
import { RichTextEditForm } from "@/components/edit/forms/rich-text-form";
import { ServicesEditForm } from "@/components/edit/forms/services-form";
import { TestimonialsEditForm } from "@/components/edit/forms/testimonials-form";
import { AboutSection } from "@/components/sections/about";
import { BlogListSection } from "@/components/sections/blog-list";
import { ColumnsSection } from "@/components/sections/columns";
import { TwoColumnSection } from "@/components/sections/two-column";
import { ContactSection } from "@/components/sections/contact";
import { CtaSection } from "@/components/sections/cta";
import { GallerySection } from "@/components/sections/gallery";
import { HeroSection } from "@/components/sections/hero";
import { RichTextSection } from "@/components/sections/rich-text";
import { ServicesSection } from "@/components/sections/services";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { aboutDefaultContent, aboutSchema } from "@/lib/sections/schemas/about";
import { blogListDefaultContent, blogListSchema } from "@/lib/sections/schemas/blog-list";
import { columnsDefaultContent, columnsSchema } from "@/lib/sections/schemas/columns";
import { twoColumnDefaultContent, twoColumnSchema } from "@/lib/sections/schemas/two-column";
import { contactDefaultContent, contactSchema } from "@/lib/sections/schemas/contact";
import { ctaDefaultContent, ctaSchema } from "@/lib/sections/schemas/cta";
import { galleryDefaultContent, gallerySchema } from "@/lib/sections/schemas/gallery";
import { heroDefaultContent, heroSchema } from "@/lib/sections/schemas/hero";
import { richTextDefaultContent, richTextSchema } from "@/lib/sections/schemas/rich-text";
import { servicesDefaultContent, servicesSchema } from "@/lib/sections/schemas/services";
import { testimonialsDefaultContent, testimonialsSchema } from "@/lib/sections/schemas/testimonials";
import {
  defineSection,
  type SectionContent,
  type SectionDefinition,
  type SectionType,
} from "@/lib/sections/types";

export const sectionRegistry: Partial<Record<SectionType, SectionDefinition<SectionContent>>> = {
  hero: defineSection({
    type: "hero",
    label: "Hero",
    schema: heroSchema,
    defaultContent: heroDefaultContent,
    Component: HeroSection,
    EditForm: HeroEditForm,
  }),
  about: defineSection({
    type: "about",
    label: "About",
    schema: aboutSchema,
    defaultContent: aboutDefaultContent,
    Component: AboutSection,
    EditForm: AboutEditForm,
  }),
  services: defineSection({
    type: "services",
    label: "Services",
    schema: servicesSchema,
    defaultContent: servicesDefaultContent,
    Component: ServicesSection,
    EditForm: ServicesEditForm,
  }),
  testimonials: defineSection({
    type: "testimonials",
    label: "Testimonials",
    schema: testimonialsSchema,
    defaultContent: testimonialsDefaultContent,
    Component: TestimonialsSection,
    EditForm: TestimonialsEditForm,
  }),
  cta: defineSection({
    type: "cta",
    label: "Call to Action",
    schema: ctaSchema,
    defaultContent: ctaDefaultContent,
    Component: CtaSection,
    EditForm: CtaEditForm,
  }),
  contact: defineSection({
    type: "contact",
    label: "Contact",
    schema: contactSchema,
    defaultContent: contactDefaultContent,
    Component: ContactSection,
    EditForm: ContactEditForm,
  }),
  rich_text: defineSection({
    type: "rich_text",
    label: "Rich Text",
    schema: richTextSchema,
    defaultContent: richTextDefaultContent,
    Component: RichTextSection,
    EditForm: RichTextEditForm,
  }),
  gallery: defineSection({
    type: "gallery",
    label: "Gallery",
    schema: gallerySchema,
    defaultContent: galleryDefaultContent,
    Component: GallerySection,
    EditForm: GalleryEditForm,
  }),
  blog_list: defineSection({
    type: "blog_list",
    label: "Blog Posts",
    schema: blogListSchema,
    defaultContent: blogListDefaultContent,
    Component: BlogListSection,
    EditForm: BlogListEditForm,
  }),
  two_column: defineSection({
    type: "two_column",
    label: "Two Column",
    schema: twoColumnSchema,
    defaultContent: twoColumnDefaultContent,
    Component: TwoColumnSection,
    EditForm: TwoColumnEditForm,
  }),
  columns: defineSection({
    type: "columns",
    label: "Columns",
    schema: columnsSchema,
    defaultContent: columnsDefaultContent,
    Component: ColumnsSection,
    EditForm: ColumnsEditForm,
  }),
};

export function getSectionDefinition(type: SectionType): SectionDefinition<SectionContent> | undefined {
  return sectionRegistry[type];
}

export const sectionTypeOptions = Object.values(sectionRegistry).map((definition) => ({
  type: definition.type,
  label: definition.label,
}));
