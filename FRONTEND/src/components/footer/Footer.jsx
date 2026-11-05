const Footer = ({Link}) => {
    return(
    <footer className="border-t bg-secondary/30 mt-20" id="footer">
        <div className="container px-4 py-12 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
            <h3 className="font-bold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/">Gadgets</Link></li>
                <li><Link to="/">Fashion</Link></li>
                <li><Link to="/">Accessories</Link></li>
            </ul>
            </div>
            <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/">Contact Us</Link></li>
                <li><Link to="/">Shipping</Link></li>
                <li><Link to="/">Returns</Link></li>
            </ul>
            </div>
            <div>
            <h3 className="font-bold mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/order">My Orders</Link></li>
            </ul>
            </div>
            <div>
            <h3 className="font-bold mb-4">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
                DeepStore is a project by Deep Tech interns focused on providing the best shopping experience for tech and fashion enthusiasts.
            </p>
            </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            © 2024 DeepStore. Built with React by Abdullah & Team.
        </div>
        </div>
    </footer>
    )
  
};
export default Footer