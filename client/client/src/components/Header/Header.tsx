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
            <img src="./img/icons/plus.png" alt="" width={20} height={20} />
            <input type="text" placeholder="Search"/>
            </div>
        
        </header>
        </>
    )
}