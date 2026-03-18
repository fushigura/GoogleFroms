import "./AddForm.scss"
import { Link } from "react-router-dom"

interface AddFormProps {
  onClick?: () => void;
  label?: string;
}

export default function AddForm({ onClick, label = 'Create' }: AddFormProps) {
    return(
        <>
        <Link to={"/form" } style={{textDecoration: "none", color: "black"}}>
        <div className="add-form-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(); }}>
            <div className="add-form">
                <img src="./img/icons/plus.png"  width={80} height={80} alt="" />
            </div>
            <div className="discribe">Blank Form</div>
        </div>
        </Link>
        </>
    )
}