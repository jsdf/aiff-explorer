import './styles.css';
import * as AIFF from './aiff';
import {useState, useCallback} from 'react';
import Details from './Details';

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.addEventListener('load', () => {
      resolve(reader.result);
    });
    reader.addEventListener('error', () => {
      reject(reader.error);
    });
  });
}

const boxStyle = {
  border: 'solid 1px black',
};
const textStyle = {
  margin: '8px 8px',
  wordWrap: 'break-word',
};
const textStyleFlushLeft = {
  margin: '8px 0',
  wordWrap: 'break-word',
};

function DisplayObject({object}) {
  return (
    <div style={{...boxStyle, margin: '8px 0px'}}>
      {Object.keys(object).map((key) => {
        const value = object[key];
        if (value && typeof value === 'object') {
          if (Array.isArray(value)) {
            return (
              <div key={key} style={textStyle}>
                {key}:{' '}
                {value.map((v, i) => (
                  <DisplayObject key={i} object={v} />
                ))}
              </div>
            );
          }
          if (typeof value.length === 'number') {
            return (
              <div key={key} style={textStyle}>
                {key}: {`Buffer {size: ${value.length}}`}
              </div>
            );
          }
          return (
            <div key={key} style={textStyle}>
              {key}: <DisplayObject object={value} />
            </div>
          );
        }
        return (
          <div key={key} style={textStyle}>
            {key}: {JSON.stringify(value)}
          </div>
        );
      })}
    </div>
  );
}

function AiffChunk({chunk}) {
  const {ckID, ckSize, localChunks} = chunk;
  let chunkSpecificData = chunk.parsed;
  if (ckID === 'FORM') {
    chunkSpecificData = {formType: chunk.formType};
  }

  // <summary style={{...textStyle, fontWeight: 'bold'}}>{ckID}</summary>
  return (
    <div style={{...boxStyle, margin: '8px 0px'}}>
      <Details
        style={textStyle}
        startOpen
        summary={ckID}
        summaryStyle={{
          width: '100%',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        <div style={textStyleFlushLeft}>chunk size: {ckSize}</div>
        {chunkSpecificData && (
          <div style={textStyleFlushLeft}>
            {ckID} fields:{' '}
            {typeof chunkSpecificData === 'object' ? (
              <DisplayObject object={chunkSpecificData} />
            ) : (
              JSON.stringify(chunkSpecificData)
            )}
          </div>
        )}
        {localChunks && (
          <div style={textStyleFlushLeft}>
            local chunks:
            {localChunks.map((lchunk, i) => (
              <AiffChunk key={i} chunk={lchunk} />
            ))}
          </div>
        )}
        <div style={{...textStyleFlushLeft, fontSize: '0.8em', color: '#777'}}>
          end {ckID} chunk
        </div>
      </Details>
    </div>
  );
}

export default function App() {
  const [aiff, setAiff] = useState(null);
  const [error, setError] = useState(null);

  const handleFiles = useCallback(async function handleFiles(e) {
    const fileList =
      e.currentTarget.files; /* now you can work with the file list */

    const data = await readFile(fileList[0]);
    try {
      setAiff(AIFF.parse(new Buffer(data), {includeRawChunks: true}));
      setError(null);
    } catch (err) {
      setAiff(null);
      setError(err);
    }
  }, []);

  return (
    <div className="App">
      <h1>AIFF explorer</h1>
      <div>
        <p>This tool visualizes the chunks in an AIFF file.</p>
        <input
          type="file"
          id="input"
          onChange={handleFiles}
          style={{
            cursor: 'pointer',
            height: aiff ? null : 300,
            width: aiff ? null : 600,
            display: aiff ? null : 'block',
            border: 'dashed #aaa 1px',
            padding: 16,
          }}
        />
      </div>

      {error && (
        <p>
          Error: this is probably not a valid AIFF file ({error.toString()})
        </p>
      )}
      {aiff &&
        aiff.fileChunks.map((chunk, i) => <AiffChunk key={i} chunk={chunk} />)}
      {!(aiff || error) && (
        <div>
          <p>
            Select (or drag and drop) an .aif, .aiff, or .aifc file to begin.
          </p>
        </div>
      )}
    </div>
  );
}
