import React from 'react';

// Import SAME table components but in PRINT mode

import BandiTable from './Tables/For View/BandiTable';
import FamilyTable from './Tables/For View/FamilyTable';
import BandiMuddaTable from './Tables/For View/BandiMuddaTable';
import BandiKaidTable from './Tables/For View/BandiKaidTable';
import BandiAddressTable from './Tables/For View/BandiAddressTable';
import BandiIDTable from './Tables/For View/BandiIDTable';
import BandiFineTable from './Tables/For View/BandiFineTable';
import BandiPunrabednTable from './Tables/For View/BandiPunrabednTable.jsx';
import BandiTransferHistoryTable from './Tables/For View/BandiTransferHistoryTable';
import BandiEscapeTable from './Tables/For View/BandiEscapeTable';
import BandiReleaseTable from './Tables/For View/BandiReleaseTable';

const Section = ({ title, children }) => (
  <section className="print-section">
    <h3>{title}</h3>
    {children}
  </section>
);

const BandiPrintLayout = ({ bandi_id }) => {
  return (
    <div className="print-wrapper">

      <Section title="१. व्यक्तिगत विवरण">
        <BandiTable bandi_id={bandi_id} print />
      </Section>

      <Section title="२. मुद्दा विवरण">
        <BandiMuddaTable bandi_id={bandi_id} print />
      </Section>

      <Section title="३. कैद विवरण">
        <BandiKaidTable bandi_id={bandi_id} print />
      </Section>

      <Section title="४. ठेगाना विवरण">
        <BandiAddressTable bandi_id={bandi_id} print />
      </Section>

      <Section title="५. पारिवारिक विवरण">
        <FamilyTable bandi_id={bandi_id} print />
      </Section>

      <Section title="६. परिचय पत्र">
        <BandiIDTable bandi_id={bandi_id} print />
      </Section>

      <Section title="७. जरिवाना विवरण">
        <BandiFineTable bandi_id={bandi_id} print />
      </Section>

      <Section title="८. दण्ड विवरण">
        <BandiPunrabednTable bandi_id={bandi_id} print />
      </Section>

      <Section title="९. स्थानान्तरण इतिहास">
        <BandiTransferHistoryTable bandi_id={bandi_id} print />
      </Section>

      <Section title="१०. फरार विवरण">
        <BandiEscapeTable bandi_id={bandi_id} print />
      </Section>

      <Section title="११. रिहाई विवरण">
        <BandiReleaseTable bandi_id={bandi_id} print />
      </Section>

    </div>
  );
};

export default BandiPrintLayout;
