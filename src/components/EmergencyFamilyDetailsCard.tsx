import React, { useState } from 'react';
import { EmergencyContact, PatientProfile } from '../types/dashboard';

interface EmergencyFamilyDetailsCardProps {
  patient: PatientProfile;
  onUpdateContacts: (updatedContacts: EmergencyContact[]) => void;
  onShowToast: (msg: string, type?: 'SUCCESS' | 'INFO' | 'ALERT') => void;
}

export const EmergencyFamilyDetailsCard: React.FC<EmergencyFamilyDetailsCardProps> = ({
  patient,
  onUpdateContacts,
  onShowToast,
}) => {
  const contacts = patient.emergencyContacts || [];
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<EmergencyContact>>({});
  const [callingContact, setCallingContact] = useState<EmergencyContact | null>(null);
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      relationship: 'Spouse',
      phone: '',
      alternatePhone: '',
      email: '',
      address: '',
      isNextOfKin: contacts.length === 0,
      isHealthcareProxy: false,
      notes: '',
    });
    setIsAddingNew(true);
  };

  const handleOpenEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({ ...contact });
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.phone?.trim()) {
      onShowToast('Please provide both contact name and phone number.', 'ALERT');
      return;
    }

    let updatedList: EmergencyContact[] = [];

    if (isAddingNew) {
      const newContact: EmergencyContact = {
        id: `ec-${Date.now()}`,
        name: formData.name.trim(),
        relationship: formData.relationship || 'Relative',
        phone: formData.phone.trim(),
        alternatePhone: formData.alternatePhone?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        isNextOfKin: !!formData.isNextOfKin,
        isHealthcareProxy: !!formData.isHealthcareProxy,
        notes: formData.notes?.trim() || undefined,
      };

      // If marked as next of kin, unmark others
      if (newContact.isNextOfKin) {
        updatedList = contacts.map((c) => ({ ...c, isNextOfKin: false }));
      } else {
        updatedList = [...contacts];
      }
      updatedList.push(newContact);
      onShowToast(`Emergency contact ${newContact.name} added successfully!`, 'SUCCESS');
    } else if (editingContact) {
      updatedList = contacts.map((c) => {
        if (c.id === editingContact.id) {
          return {
            ...c,
            name: formData.name!.trim(),
            relationship: formData.relationship || c.relationship,
            phone: formData.phone!.trim(),
            alternatePhone: formData.alternatePhone?.trim() || undefined,
            email: formData.email?.trim() || undefined,
            address: formData.address?.trim() || undefined,
            isNextOfKin: !!formData.isNextOfKin,
            isHealthcareProxy: !!formData.isHealthcareProxy,
            notes: formData.notes?.trim() || undefined,
          };
        }
        if (formData.isNextOfKin) {
          return { ...c, isNextOfKin: false };
        }
        return c;
      });
      onShowToast(`Emergency contact ${formData.name} updated!`, 'SUCCESS');
    }

    onUpdateContacts(updatedList);
    setIsAddingNew(false);
    setEditingContact(null);
  };

  const handleDeleteContact = (contactId: string, name: string) => {
    if (contacts.length <= 1) {
      onShowToast('At least one emergency family contact is required.', 'ALERT');
      return;
    }
    const updated = contacts.filter((c) => c.id !== contactId);
    onUpdateContacts(updated);
    onShowToast(`Removed ${name} from emergency contacts list.`, 'INFO');
  };

  const handleSimulateCall = (contact: EmergencyContact) => {
    setCallingContact(contact);
    setTimeout(() => {
      setCallingContact(null);
      onShowToast(`Call initiated to ${contact.name} (${contact.phone}).`, 'SUCCESS');
    }, 1200);
  };

  const handleSendFamilyStatusUpdate = () => {
    setIsSendingAlert(true);
    setTimeout(() => {
      setIsSendingAlert(false);
      onShowToast(
        `Family check-in SMS sent to ${contacts.length} registered emergency contact${
          contacts.length > 1 ? 's' : ''
        }: "${patient.name} is resting comfortably in ${patient.ward}, ${patient.roomBed}."`,
        'SUCCESS'
      );
    }, 1000);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e2e8f0] shadow-xs space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[24px]">contact_emergency</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">
                Emergency Family &amp; Next-of-Kin Details
              </h3>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Emergency Priority
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              Authorized family contacts, notification preferences &amp; healthcare proxy
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Add Family Contact</span>
        </button>
      </div>

      {/* Emergency Contacts List */}
      {contacts.length === 0 ? (
        <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
          <span className="material-symbols-outlined text-[40px] text-slate-400">group_off</span>
          <p className="text-sm font-semibold text-slate-700">No emergency contacts listed yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Please add at least one primary family contact for hospital admissions and clinical emergencies.
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#003d9b] text-white text-xs font-bold rounded-xl"
          >
            Add Primary Contact
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact, index) => {
            return (
              <div
                key={contact.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  contact.isNextOfKin
                    ? 'bg-gradient-to-br from-rose-50/60 via-white to-blue-50/40 border-rose-200/80 shadow-xs'
                    : 'bg-[#f8fafc] border-slate-200/80 hover:bg-white'
                }`}
              >
                {/* Contact Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                        contact.isNextOfKin
                          ? 'bg-rose-600 text-white'
                          : 'bg-blue-100 text-[#003d9b]'
                      }`}
                    >
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-extrabold text-[#0f172a]">
                          {contact.name}
                        </h4>
                        <span className="px-2.5 py-0.5 bg-slate-200/80 text-slate-800 text-xs font-semibold rounded-md">
                          {contact.relationship}
                        </span>
                        {contact.isNextOfKin && (
                          <span className="px-2.5 py-0.5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center gap-1 shadow-2xs">
                            <span className="material-symbols-outlined text-[13px]">emergency</span>
                            Primary Next of Kin
                          </span>
                        )}
                        {contact.isHealthcareProxy && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300/80 text-[11px] font-bold rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">verified_user</span>
                            Healthcare Proxy (MPOA)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#64748b] mt-0.5">
                        {contact.isNextOfKin
                          ? 'Primary designated emergency decision maker'
                          : 'Secondary family emergency contact'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleSimulateCall(contact)}
                      disabled={callingContact?.id === contact.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                      title={`Call ${contact.name}`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {callingContact?.id === contact.id ? 'sync' : 'call'}
                      </span>
                      <span>{callingContact?.id === contact.id ? 'Dialing...' : 'Call'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(contact)}
                      className="p-1.5 text-slate-600 hover:text-[#003d9b] hover:bg-slate-100 rounded-lg transition"
                      title="Edit Contact"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>

                    {contacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteContact(contact.id, contact.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remove Contact"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3.5 mt-3 border-t border-slate-200/60 text-xs text-[#334155]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[17px] text-emerald-600">phone</span>
                    <span className="font-semibold text-slate-500">Primary:</span>
                    <a
                      href={`tel:${contact.phone}`}
                      className="font-bold text-[#003d9b] hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>

                  {contact.alternatePhone && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[17px] text-blue-500">phone_android</span>
                      <span className="font-semibold text-slate-500">Alt Phone:</span>
                      <span className="font-medium text-slate-800">{contact.alternatePhone}</span>
                    </div>
                  )}

                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[17px] text-indigo-500">mail</span>
                      <span className="font-semibold text-slate-500">Email:</span>
                      <a
                        href={`mailto:${contact.email}`}
                        className="font-medium text-slate-800 hover:underline truncate"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}

                  {contact.address && (
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <span className="material-symbols-outlined text-[17px] text-rose-500 shrink-0">home_pin</span>
                      <span className="font-semibold text-slate-500 shrink-0">Address:</span>
                      <span className="font-medium text-slate-800 truncate">{contact.address}</span>
                    </div>
                  )}

                  {contact.notes && (
                    <div className="sm:col-span-2 mt-1 bg-white/80 p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-amber-500 shrink-0 mt-0.5">info</span>
                      <span>{contact.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Action Footer: Send Family Status Notification & Direct Call */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="material-symbols-outlined text-[16px] text-emerald-500">verified</span>
          <span>Verified Family Emergency Contacts • Encrypted Hospital Record</span>
        </div>

        <button
          type="button"
          onClick={handleSendFamilyStatusUpdate}
          disabled={isSendingAlert || contacts.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-amber-400">
            {isSendingAlert ? 'hourglass_top' : 'notifications_active'}
          </span>
          <span>{isSendingAlert ? 'Sending Update...' : 'Send Family Status SMS'}</span>
        </button>
      </div>

      {/* Add / Edit Contact Modal */}
      {(isAddingNew || editingContact) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">contact_emergency</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#0f172a]">
                  {isAddingNew ? 'Add Emergency Family Contact' : 'Edit Emergency Contact'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingContact(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4">
              {/* Name & Relationship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Priya Kumar"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#003d9b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Relationship <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.relationship || 'Spouse'}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#003d9b]"
                  >
                    <option value="Spouse / Wife">Spouse / Wife</option>
                    <option value="Spouse / Husband">Spouse / Husband</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Other Relative">Other Relative</option>
                  </select>
                </div>
              </div>

              {/* Phone & Alternate Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#003d9b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.alternatePhone || ''}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    placeholder="Optional secondary phone"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#003d9b]"
                  />
                </div>
              </div>

              {/* Email & Residence */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@example.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#003d9b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Home / Residential Address
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address, City, State"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#003d9b]"
                  />
                </div>
              </div>

              {/* Checkboxes: Next of Kin & Proxy */}
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!formData.isNextOfKin}
                    onChange={(e) => setFormData({ ...formData, isNextOfKin: e.target.checked })}
                    className="w-4 h-4 rounded text-[#003d9b] focus:ring-[#003d9b]"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Primary Next of Kin (First Point of Contact)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Hospital staff will notify this person first in clinical events.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none pt-2 border-t border-slate-200/60">
                  <input
                    type="checkbox"
                    checked={!!formData.isHealthcareProxy}
                    onChange={(e) =>
                      setFormData({ ...formData, isHealthcareProxy: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Designated Medical Healthcare Proxy (MPOA)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Authorized to make healthcare decisions if patient is incapacitated.
                    </span>
                  </div>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Notes / Availability Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. 24/7 reachable, works night shifts, speaks Hindi and English..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#003d9b]"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingContact(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#003d9b] hover:bg-[#0052cc] text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Save Contact Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
