const Modal = ({title, onClose, children}) => {
  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50 rounded-2xl ">
        <div className="bg-white border border-paper-line max-w-md w-full p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg text-ledger">{title}</h2>
                <button onClick={onClose} className="text-red-500 hover:text-red-400 text-2xl loading-none cursor-pointer mb-3">
                    x
                </button>
            </div>
            {children}
        </div>
    </div>
  )
}
export default Modal