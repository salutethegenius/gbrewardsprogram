import Company from "../utilities/Company";
import Flexbox from "./Flexbox";

const Footer = () => {
    return (
        <div className="footer" style={{padding: '20px'}}>
            <Flexbox justifyContent="space-between" alignItems="center">
                <img className="hide-on-med-and-down" src="/logo.png" alt="logo" style={{ width: '100px', opacity: .4 }} />
                <small style={{ opacity: .4 }}>
                    Copyright {(new Date()).getFullYear()} © {Company.name} All rights reserved | <a href={Company.privacy}>Privacy Policy</a> |  <a href={Company.terms}>Terms & Conditions</a>
                </small>
            </Flexbox>
        </div>
    );
}

export default Footer;