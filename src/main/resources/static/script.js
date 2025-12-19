const API = '/api';

const EmptyState = ({ text }) => (
  <div className="empty-state">
    <p>{text}</p>
  </div>
);

function App() {
  const [tab, setTab] = React.useState('users');
  const [users, setUsers] = React.useState([]);
  const [groups, setGroups] = React.useState([]);
  const [expenses, setExpenses] = React.useState([]);
  const [balances, setBalances] = React.useState([]);
  const [groupMembers, setGroupMembers] = React.useState([]);
  const [selectedGroup, setSelectedGroup] = React.useState(null);
  const [message, setMessage] = React.useState(null);

  const [userForm, setUserForm] = React.useState({ name:'', email:'', phone:'' });
  const [groupName, setGroupName] = React.useState('');
  const [selectedMemberIds, setSelectedMemberIds] = React.useState([]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const apiGet = async (url, setter) => {
    try {
      const res = await fetch(API + url);
      setter(await res.json());
    } catch {}
  };

  React.useEffect(() => {
    apiGet('/users', setUsers);
    apiGet('/groups', setGroups);
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API}/users`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(userForm)
      });
      setUserForm({name:'',email:'',phone:''});
      apiGet('/users', setUsers);
      showMessage('User created','success');
    } catch {
      showMessage('Error creating user','error');
    }
  };

  const getInitials = name => name ? name[0].toUpperCase() : '?';

  return (
    <div className="container">
      <h1>Expense Sharing App</h1>

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="tabs">
        {['users','groups','expenses','balances','settle'].map(t => (
          <button key={t} className={`tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab==='users' && (
        <div className="grid">
          <div className="card">
            <h3>Create User</h3>
            <form onSubmit={createUser}>
              <input placeholder="Name" value={userForm.name}
                     onChange={e=>setUserForm({...userForm,name:e.target.value})} required/>
              <input placeholder="Email" value={userForm.email}
                     onChange={e=>setUserForm({...userForm,email:e.target.value})} required/>
              <input placeholder="Phone" value={userForm.phone}
                     onChange={e=>setUserForm({...userForm,phone:e.target.value})} required/>
              <button className="btn btn-primary">Create</button>
            </form>
          </div>

          <div className="card">
            <h3>Users</h3>
            {!users.length ? <EmptyState text="No users yet"/> :
              users.map(u => (
                <div key={u.id} className="list-item">
                  <div className="user-info">
                    <div className="user-avatar">{getInitials(u.name)}</div>
                    <strong>{u.name}</strong>
                  </div>
                  <span>ID: {u.id}</span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
