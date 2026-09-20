import { SiteHeader, SiteFooter } from './site-header';
export function LegalPage({title,intro,children}:{title:string;intro:string;children:React.ReactNode}) {
 return <><SiteHeader/><main className="legal-main"><a className="legal-back" href="/">← Back to bookings</a><header className="legal-heading"><span className="eyebrow">VANDLOVU GROUP · BOOKINGS</span><h1>{title}</h1><p>{intro}</p><span className="legal-updated">Last updated: 20 September 2026</span></header><article className="legal-content">{children}</article><a className="legal-back" href="/">Return to the booking website →</a></main><SiteFooter/></>;
}
