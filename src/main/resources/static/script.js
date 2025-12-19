const API = '/api';

function App() {
    const [tab, setTab] = React.useState('users');
    const [users, setUsers] = React.useState([]);
    const [groups, setGroups] = React.useState([]);
    const [expenses, setExpenses] = React.useState([]);
    const [balances, setBalances] = React.useState([]);
    const [message, setMessage] = React.useState(null);
    const [selectedGroup, setSelectedGroup] = React.useState(null);
    const [groupMembers, setGroupMembers] = React.useState([]);

    // Form states
    const [userName, setUserName] = React.useState('');
    const [userEmail, setUserEmail] = React.useState('');
    const [userPhone, setUserPhone] = React.useState('');

    const [groupName, setGroupName] = React.useState('');
    const [selectedMemberIds, setSelectedMemberIds] = React.useState([]);

    const [expenseDesc, setExpenseDesc] = React.useState('');
    const [expenseAmount, setExpenseAmount] = React.useState('');
    const [expenseCategory, setExpenseCategory] = React.useState('FOOD');
    const [expenseSplitType, setExpenseSplitType] = React.useState('EQUAL');
    const [expensePaidBy, setExpensePaidBy] = React.useState('');
    const [expenseGroupId, setExpenseGroupId] = React.useState('');
    const [splitValues, setSplitValues] = React.useState({});

    const [settleFrom, setSettleFrom] = React.useState('');
    const [settleTo, setSettleTo] = React.useState('');
    const [settleAmount, setSettleAmount] = React.useState('');

    React.useEffect(() => {
        fetchUsers();
        fetchGroups();
    }, []);

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API}/users`);
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.log('[v0] Error fetching users:', err);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await fetch(`${API}/groups`);
            const data = await res.json();
            setGroups(data);
        } catch (err) {
            console.log('[v0] Error fetching groups:', err);
        }
    };

    const fetchGroupDetails = async (groupId) => {
        try {
            const res = await fetch(`${API}/groups/${groupId}`);
            const data = await res.json();
            console.log('[v0] Group details:', data);
            setGroupMembers(data.members || []);
            return data;
        } catch (err) {
            console.log('[v0] Error fetching group details:', err);
            return null;
        }
    };

    const fetchExpenses = async (groupId) => {
        try {
            const res = await fetch(`${API}/groups/${groupId}/expenses`);
            const data = await res.json();
            setExpenses(data);
        } catch (err) {
            console.log('[v0] Error fetching expenses:', err);
        }
    };

    const fetchBalances = async (groupId) => {
               try {
            const res = await fetch(`${API}/groups/${groupId}/balances`);
            const data = await res.json();
            setBalances(data);
        } catch (err) {
            console.log('[v0] Error fetching balances:', err);
        }
    };

    const createUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: userName, email: userEmail, phone: userPhone })
            });
            if (!res.ok) {
                 throw new Error('Failed to create user');    
                }

             showMessage('User created successfully!', 'success');
             setUserName('');
             setUserEmail('');
             setUserPhone('');
             fetchUsers();

        } catch (err) {
                    console.error(err);
                    showMessage('Error creating user', 'error');
            }

    };

    const handleMemberSelect = (userId) => {
        const id = parseInt(userId);
        if (selectedMemberIds.includes(id)) {
            setSelectedMemberIds(selectedMemberIds.filter(m => m !== id));
        } else {
            setSelectedMemberIds([...selectedMemberIds, id]);
        }
    };

    const createGroup = async (e) => {
        e.preventDefault();
        if (selectedMemberIds.length === 0) {
            showMessage('Please select at least one member', 'error');
            return;
        }
        try {
            const res = await fetch(`${API}/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: groupName, memberIds: selectedMemberIds })
            });
            if (res.ok) {
                showMessage('Group created successfully!', 'success');
                setGroupName(''); setSelectedMemberIds([]);
                fetchGroups();
            }
        } catch (err) {
            showMessage('Error creating group', 'error');
        }
    };

    const selectGroup = async (groupId) => {
        const gid = parseInt(groupId);
        setSelectedGroup(gid);
        setExpenseGroupId(gid);
        await fetchGroupDetails(gid);
        await fetchExpenses(gid);
        await fetchBalances(gid);
        showMessage('Group selected!', 'success');
    };

    const createExpense = async (e) => {
        e.preventDefault();
        if (!expenseGroupId) {
            showMessage('Please select a group first', 'error');
            return;
        }
        if (!expensePaidBy) {
            showMessage('Please select who paid', 'error');
            return;
        }
        try {
            const body = {
                description: expenseDesc,
                amount: parseFloat(expenseAmount),
                category: expenseCategory,
                splitType: expenseSplitType,
                paidByUserId: parseInt(expensePaidBy),
                groupId: parseInt(expenseGroupId)
            };
            if (expenseSplitType !== 'EQUAL') {
                body.splits = {};
                Object.keys(splitValues).forEach(userId => {
                    if (splitValues[userId]) {
                        body.splits[parseInt(userId)] = parseFloat(splitValues[userId]);
                    }
                });
            }
            console.log('[v0] Creating expense:', body);
            const res = await fetch(`${API}/expenses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                showMessage('Expense added successfully!', 'success');
                setExpenseDesc(''); setExpenseAmount(''); setSplitValues({});
                setExpensePaidBy('');
                await fetchExpenses(expenseGroupId);
                await fetchBalances(expenseGroupId);
            }
        } catch (err) {
            showMessage('Error adding expense', 'error');
        }
    };

    const settleDue = async (e) => {
        e.preventDefault();
        if (!selectedGroup) {
            showMessage('Please select a group first', 'error');
            return;
        }
        try {
            const res = await fetch(`${API}/settlements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fromUserId: parseInt(settleFrom),
                    toUserId: parseInt(settleTo),
                    groupId: parseInt(selectedGroup),
                    amount: parseFloat(settleAmount)
                })
            });
            if (res.ok) {
                showMessage('Settlement recorded successfully!', 'success');
                setSettleFrom(''); setSettleTo(''); setSettleAmount('');
                await fetchBalances(selectedGroup);
            }
        } catch (err) {
            showMessage('Error settling due', 'error');
        }
    };

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    const currentGroupName = groups.find(g => g.id === selectedGroup)?.name || '';

    return (
        <div className="container">
            <h1>Expense Sharing App</h1>
            
            {message && <div className={`message ${message.type}`}>{message.text}</div>}

            <div className="tabs">
                <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users</button>
                <button className={`tab ${tab === 'groups' ? 'active' : ''}`} onClick={() => setTab('groups')}>Groups</button>
                <button className={`tab ${tab === 'expenses' ? 'active' : ''}`} onClick={() => setTab('expenses')}>Expenses</button>
                <button className={`tab ${tab === 'balances' ? 'active' : ''}`} onClick={() => setTab('balances')}>Balances</button>
                <button className={`tab ${tab === 'settle' ? 'active' : ''}`} onClick={() => setTab('settle')}>Settle</button>
            </div>

            {/* USERS TAB */}
            {tab === 'users' && (
                <div className="grid">
                    <div className="card">
                        <h3>Create New User</h3>
                        <form onSubmit={createUser}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input value={userName} onChange={e => setUserName(e.target.value)} placeholder="Enter name" required />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="Enter email" required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="Enter phone" required />
                            </div>
                            <button type="submit" className="btn btn-primary">Create User</button>
                        </form>
                    </div>
                    <div className="card">
                        <h3>All Users ({users.length})</h3>
                        {users.length === 0 && (
                            <div className="empty-state">
                                <p>No users yet. Create your first user!</p>
                            </div>
                        )}
                        {users.map(user => (
                            <div key={user.id} className="list-item">
                                <div className="user-info">
                                    <div className="user-avatar">{getInitials(user.name)}</div>
                                    <div>
                                        <strong>{user.name}</strong>
                                        <br/><small>{user.email}</small>
                                    </div>
                                </div>
                                <span style={{color: '#888'}}>ID: {user.id}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* GROUPS TAB */}
            {tab === 'groups' && (
                <div className="grid">
                    <div className="card">
                        <h3>Create New Group</h3>
                        <form onSubmit={createGroup}>
                            <div className="form-group">
                                <label>Group Name</label>
                                <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g., Goa Trip 2024" required />
                            </div>
                            <div className="form-group">
                                <label>Select Members (click to select)</label>
                                <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px'}}>
                                    {users.map(user => (
                                        <div 
                                            key={user.id}
                                            onClick={() => handleMemberSelect(user.id)}
                                            style={{
                                                padding: '10px 16px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                background: selectedMemberIds.includes(user.id) ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f0f0f0',
                                                color: selectedMemberIds.includes(user.id) ? 'white' : '#333',
                                                fontWeight: '500',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {user.name}
                                        </div>
                                    ))}
                                </div>
                                {users.length === 0 && <small>Create users first in the Users tab</small>}
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={users.length === 0}>Create Group</button>
                        </form>
                    </div>
                    <div className="card">
                        <h3>All Groups ({groups.length})</h3>
                        {groups.length === 0 && (
                            <div className="empty-state">
                                <p>No groups yet. Create your first group!</p>
                            </div>
                        )}
                        {groups.map(group => (
                            <div key={group.id} className="list-item">
                                <div>
                                    <strong>{group.name}</strong>
                                    <br/>
                                    <div style={{marginTop: '8px'}}>
                                        {group.members && group.members.length > 0 ? (
                                            group.members.map(m => (
                                                <span key={m.id} className="member-tag">{m.name}</span>
                                            ))
                                        ) : (
                                            <small>No members</small>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-info" 
                                    onClick={() => selectGroup(group.id)}
                                    style={{background: selectedGroup === group.id ? '#11998e' : ''}}
                                >
                                    {selectedGroup === group.id ? 'Selected' : 'Select'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* EXPENSES TAB */}
            {tab === 'expenses' && (
                <div className="grid">
                    <div className="card">
                        <h3>Add New Expense</h3>
                        <form onSubmit={createExpense}>
                            <div className="form-group">
                                <label>Select Group</label>
                                <select value={expenseGroupId} onChange={e => selectGroup(e.target.value)} required>
                                    <option value="">-- Select Group --</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} placeholder="e.g., Dinner at restaurant" required />
                            </div>
                            <div className="form-group">
                                <label>Amount (Rs.)</label>
                                <input type="number" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="Enter amount" required />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)}>
                                    <option value="FOOD">Food</option>
                                    <option value="TRAVEL">Travel</option>
                                    <option value="ACCOMMODATION">Accommodation</option>
                                    <option value="ENTERTAINMENT">Entertainment</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Split Type</label>
                                <select value={expenseSplitType} onChange={e => setExpenseSplitType(e.target.value)}>
                                    <option value="EQUAL">Equal Split</option>
                                    <option value="EXACT">Exact Amount</option>
                                    <option value="PERCENTAGE">Percentage</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Paid By</label>
                                <select value={expensePaidBy} onChange={e => setExpensePaidBy(e.target.value)} required>
                                    <option value="">-- Select User --</option>
                                    {groupMembers.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                {groupMembers.length === 0 && expenseGroupId && <small>Loading members...</small>}
                                {!expenseGroupId && <small>Select a group first</small>}
                            </div>
                            {expenseSplitType !== 'EQUAL' && groupMembers.length > 0 && (
                                <div className="splits-section">
                                    <label><strong>{expenseSplitType === 'PERCENTAGE' ? 'Enter Percentages (must total 100%)' : 'Enter Exact Amounts'}</strong></label>
                                    {groupMembers.map(m => (
                                        <div key={m.id} className="split-input">
                                            <span>{m.name}:</span>
                                            <input 
                                                type="number" 
                                                placeholder={expenseSplitType === 'PERCENTAGE' ? 'e.g., 33.33' : 'e.g., 1000'} 
                                                value={splitValues[m.id] || ''} 
                                                onChange={e => setSplitValues({...splitValues, [m.id]: e.target.value})}
                                            />
                                            <span>{expenseSplitType === 'PERCENTAGE' ? '%' : 'Rs.'}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button type="submit" className="btn btn-primary" style={{marginTop: '15px'}}>Add Expense</button>
                        </form>
                    </div>
                    <div className="card">
                        <h3>Expenses {currentGroupName ? `- ${currentGroupName}` : ''}</h3>
                        {!selectedGroup && (
                            <div className="empty-state">
                                <p>Select a group to view expenses</p>
                            </div>
                        )}
                        {selectedGroup && expenses.length === 0 && (
                            <div className="empty-state">
                                <p>No expenses yet. Add your first expense!</p>
                            </div>
                        )}
                        {expenses.map(exp => (
                            <div key={exp.id} className="list-item">
                                <div>
                                    <strong>{exp.description}</strong>
                                    <br/>
                                    <small>{exp.category} | {exp.splitType} split | Paid by: {exp.paidBy?.name}</small>
                                </div>
                                <span className="balance-positive">Rs. {exp.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BALANCES TAB */}
            {tab === 'balances' && (
                <div className="card">
                    <h3>Balances - Who Owes Whom</h3>
                    <div className="form-group" style={{maxWidth: '400px'}}>
                        <label>Select Group</label>
                        <select value={selectedGroup || ''} onChange={e => selectGroup(e.target.value)}>
                            <option value="">-- Select Group --</option>
                            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    {!selectedGroup && (
                        <div className="empty-state">
                            <p>Select a group to view balances</p>
                        </div>
                    )}
                    {selectedGroup && balances.length === 0 && (
                        <div className="empty-state" style={{color: '#11998e'}}>
                            <p>All settled up! No pending balances.</p>
                        </div>
                    )}
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', marginTop: '20px'}}>
                        {balances.map((b, i) => (
                            <div key={i} className="balance-card">
                                <div style={{marginBottom: '10px'}}>
                                    <span className="balance-negative">{b.fromUserName}</span>
                                    <span style={{margin: '0 10px', color: '#888'}}>owes</span>
                                    <span className="balance-positive">{b.toUserName}</span>
                                </div>
                                <div className="balance-amount">Rs. {b.amount}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SETTLE TAB */}
            {tab === 'settle' && (
                <div className="grid">
                    <div className="card">
                        <h3>Record Settlement</h3>
                        <form onSubmit={settleDue}>
                            <div className="form-group">
                                <label>Select Group</label>
                                <select value={selectedGroup || ''} onChange={e => selectGroup(e.target.value)} required>
                                    <option value="">-- Select Group --</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>From (Who is paying)</label>
                                <select value={settleFrom} onChange={e => setSettleFrom(e.target.value)} required>
                                    <option value="">-- Select User --</option>
                                    {groupMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>To (Who is receiving)</label>
                                <select value={settleTo} onChange={e => setSettleTo(e.target.value)} required>
                                    <option value="">-- Select User --</option>
                                    {groupMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount (Rs.)</label>
                                <input type="number" value={settleAmount} onChange={e => setSettleAmount(e.target.value)} placeholder="Enter amount" required />
                            </div>
                            <button type="submit" className="btn btn-success">Record Settlement</button>
                        </form>
                    </div>
                    <div className="card">
                        <h3>Pending Settlements {currentGroupName ? `- ${currentGroupName}` : ''}</h3>
                        {!selectedGroup && (
                            <div className="empty-state">
                                <p>Select a group to view pending settlements</p>
                            </div>
                        )}
                        {selectedGroup && balances.length === 0 && (
                            <div className="empty-state" style={{color: '#11998e'}}>
                                <p>All settled up!</p>
                            </div>
                        )}
                        {balances.map((b, i) => (
                            <div key={i} className="list-item">
                                <span>
                                    <strong>{b.fromUserName}</strong> owes <strong>{b.toUserName}</strong>
                                </span>
                                <span className="balance-negative">Rs. {b.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
