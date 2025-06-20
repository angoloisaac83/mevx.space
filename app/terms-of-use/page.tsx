"use client"

import PageTemplate from "@/components/page-template"

export default function TermsOfUsePage() {
  return (
    <PageTemplate title="Terms Of Use" requiresWallet={false}>
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300">Last updated: May 11, 2025</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using MEVX, you agree to be bound by these Terms of Use and all applicable laws and
          regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this
          site.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use MEVX for personal, non-commercial transitory viewing only. This is
          the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul>
          <li>Modify or copy the materials;</li>
          <li>
            Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);
          </li>
          <li>Attempt to decompile or reverse engineer any software contained on MEVX;</li>
          <li>Remove any copyright or other proprietary notations from the materials; or</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
        </ul>

        <h2>3. Disclaimer</h2>
        <p>
          The materials on MEVX are provided on an 'as is' basis. MEVX makes no warranties, expressed or implied, and
          hereby disclaims and negates all other warranties including, without limitation, implied warranties or
          conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property
          or other violation of rights.
        </p>

        <h2>4. Risk Warning</h2>
        <p>
          Cryptocurrency trading involves significant risk. The value of cryptocurrencies can go up or down, and you
          could lose all of your investment. Before trading, you should carefully consider your investment objectives,
          level of experience, and risk appetite. You should be aware of all the risks associated with cryptocurrency
          trading.
        </p>

        <h2>5. Limitations</h2>
        <p>
          In no event shall MEVX or its suppliers be liable for any damages (including, without limitation, damages for
          loss of data or profit, or due to business interruption) arising out of the use or inability to use the
          materials on MEVX, even if MEVX or a MEVX authorized representative has been notified orally or in writing of
          the possibility of such damage.
        </p>

        <h2>6. Accuracy of Materials</h2>
        <p>
          The materials appearing on MEVX could include technical, typographical, or photographic errors. MEVX does not
          warrant that any of the materials on its website are accurate, complete, or current. MEVX may make changes to
          the materials contained on its website at any time without notice.
        </p>

        <h2>7. Links</h2>
        <p>
          MEVX has not reviewed all of the sites linked to its website and is not responsible for the contents of any
          such linked site. The inclusion of any link does not imply endorsement by MEVX of the site. Use of any such
          linked website is at the user's own risk.
        </p>

        <h2>8. Modifications</h2>
        <p>
          MEVX may revise these terms of service for its website at any time without notice. By using this website, you
          are agreeing to be bound by the then current version of these terms of service.
        </p>

        <h2>9. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws and you irrevocably
          submit to the exclusive jurisdiction of the courts in that location.
        </p>

        <h2>10. Contact Us</h2>
        <p>If you have any questions about these Terms of Use, please contact us at:</p>
        <p>Email: legal@mevx.io</p>
      </div>
    </PageTemplate>
  )
}
