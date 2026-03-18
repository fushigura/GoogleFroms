import "./Header.scss"

export default function Header() {
    return(
        <>
        <header>
            <div className="logo">
                <img  src="./img/logo.png" alt="" height={40} width={40}/>
                <div>Forms</div>
            </div>

            <div className="search">
            <img src="" alt="" />
            <input type="text" placeholder="Search"/>
            </div>
        
        </header>
        </>
    )
}